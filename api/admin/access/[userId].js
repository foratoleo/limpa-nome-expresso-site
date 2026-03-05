// Vercel serverless function for /api/admin/access/:userId
// Handles DELETE (revoke) and POST (reactivate) operations
// Uses Supabase REST API directly (no package imports needed)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get userId from query (Vercel path params)
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Handle DELETE (revoke) or POST (reactivate)
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const isRevoke = req.method === 'DELETE';
  const operationName = isRevoke ? 'Revoke' : 'Reactivate';

  try {
    // Step 1: Verify admin authorization
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(`[Admin Access ${operationName}] Missing Supabase configuration`, {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Step 2: Verify the user token and check admin role
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`[Admin Access ${operationName}] Auth failed`, {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      });
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    const adminUser = await userResponse.json();
    if (!adminUser || !adminUser.id) {
      console.error(`[Admin Access ${operationName}] Invalid user response`);
      return res.status(401).json({ error: 'Unauthorized: Invalid user' });
    }

    // Step 3: Verify admin role
    const userRole = adminUser.user_metadata?.role;
    if (userRole !== 'admin') {
      console.error(`[Admin Access ${operationName}] Forbidden: User is not admin`, {
        userId: adminUser.id,
        role: userRole
      });
      return res.status(403).json({
        error: 'Forbidden: Admin access required',
        details: `User role is '${userRole || 'undefined'}', expected 'admin'`
      });
    }

    console.log(`[Admin Access ${operationName}] Admin verified`, {
      adminId: adminUser.id,
      email: adminUser.email,
      targetUserId: userId
    });

    // Step 4: Get optional reason from request body (for revoke)
    let revokeReason = null;
    if (isRevoke && req.body && req.body.reason) {
      revokeReason = req.body.reason;
    }

    // Step 5: Update access record using Supabase REST API
    const updateData = isRevoke ? {
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by: adminUser.id,
      revoke_reason: revokeReason
    } : {
      is_active: true
    };

    // Build update query with filters
    const updateParams = new URLSearchParams({
      user_id: `eq.${userId}`
    });

    if (isRevoke) {
      updateParams.append('is_active', 'eq.true');
    }

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_manual_access?${updateParams.toString()}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updateData)
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`[Admin Access ${operationName}] Failed to update access`, {
        status: updateResponse.status,
        error: errorText
      });
      return res.status(500).json({ error: `Failed to ${isRevoke ? 'revoke' : 'reactivate'} access` });
    }

    const accessData = await updateResponse.json();
    const access = Array.isArray(accessData) ? accessData[0] : accessData;

    if (!access) {
      return res.status(404).json({
        error: isRevoke
          ? 'No active access found for this user'
          : 'No access found for this user'
      });
    }

    console.log(`[Admin Access ${operationName}] Operation successful`, {
      targetUserId: userId,
      accessId: access.id
    });

    // Step 6: Return success response
    return res.status(200).json({
      success: true,
      message: `Access ${isRevoke ? 'revoked' : 'reactivated'} successfully`,
      access
    });

  } catch (error) {
    console.error(`[Admin Access ${operationName}] Unexpected error:`, error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
