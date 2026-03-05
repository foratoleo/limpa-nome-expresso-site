// Vercel serverless function for /api/admin/access/grant
// Uses Supabase REST API directly (no package imports needed)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      console.error('[Admin Access Grant] Missing Supabase configuration', {
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
      console.error('[Admin Access Grant] Auth failed', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      });
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    const adminUser = await userResponse.json();
    if (!adminUser || !adminUser.id) {
      console.error('[Admin Access Grant] Invalid user response');
      return res.status(401).json({ error: 'Unauthorized: Invalid user' });
    }

    // Step 3: Verify admin role
    const userRole = adminUser.user_metadata?.role;
    if (userRole !== 'admin') {
      console.error('[Admin Access Grant] Forbidden: User is not admin', {
        userId: adminUser.id,
        role: userRole
      });
      return res.status(403).json({
        error: 'Forbidden: Admin access required',
        details: `User role is '${userRole || 'undefined'}', expected 'admin'`
      });
    }

    console.log('[Admin Access Grant] Admin verified', {
      adminId: adminUser.id,
      email: adminUser.email
    });

    // Step 4: Validate request body
    const { email, reason, expires_at } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Step 5: Find user by email using Supabase Admin API
    const usersListResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (!usersListResponse.ok) {
      console.error('[Admin Access Grant] Failed to list users', {
        status: usersListResponse.status
      });
      return res.status(500).json({ error: 'Failed to lookup user' });
    }

    const usersData = await usersListResponse.json();
    const users = usersData.users || [];
    const targetUser = users.find(u => u.email === email);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Step 6: Check if user already has active access
    const now = new Date().toISOString();
    const existingAccessParams = new URLSearchParams({
      user_id: `eq.${targetUser.id}`,
      is_active: 'eq.true',
      select: '*'
    });

    const existingAccessResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_manual_access?${existingAccessParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (existingAccessResponse.ok) {
      const existingAccessData = await existingAccessResponse.json();
      if (Array.isArray(existingAccessData) && existingAccessData.length > 0) {
        return res.status(409).json({ error: 'User already has active manual access' });
      }
    }

    // Step 7: Grant access using Supabase REST API
    const accessData = {
      user_id: targetUser.id,
      granted_by: adminUser.id,
      granted_at: new Date().toISOString(),
      reason: reason || null,
      expires_at: expires_at || null,
      is_active: true
    };

    const grantResponse = await fetch(`${supabaseUrl}/rest/v1/user_manual_access`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(accessData)
    });

    if (!grantResponse.ok) {
      const errorText = await grantResponse.text();
      console.error('[Admin Access Grant] Failed to grant access', {
        status: grantResponse.status,
        error: errorText
      });
      return res.status(500).json({ error: 'Failed to grant access' });
    }

    const access = await grantResponse.json();
    // Supabase returns an array, get the first item
    const accessRecord = Array.isArray(access) ? access[0] : access;

    console.log('[Admin Access Grant] Access granted successfully', {
      targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      accessId: accessRecord.id
    });

    // Step 8: Return success response
    return res.status(201).json({
      success: true,
      message: 'Access granted successfully',
      access: accessRecord
    });

  } catch (error) {
    console.error('[Admin Access Grant] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
