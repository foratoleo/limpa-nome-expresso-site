// Vercel serverless function for /api/payments/status
// Uses Supabase REST API directly (no package imports needed)

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Payment Status] Missing Supabase configuration', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Step 1: Verify the user token using Supabase Auth REST API
    // Using the /auth/v1/user endpoint with the user's token
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('[Payment Status] Auth failed', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      });
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await userResponse.json();
    if (!user || !user.id) {
      console.error('[Payment Status] Invalid user response');
      return res.status(401).json({ error: 'Invalid user' });
    }

    console.log('[Payment Status] User verified', {
      userId: user.id,
      email: user.email,
      role: user.user_metadata?.role
    });

    // Step 2: Check for active payment access
    const now = new Date().toISOString();

    // Build query parameters for user_access check
    const accessParams = new URLSearchParams({
      user_id: `eq.${user.id}`,
      is_active: 'eq.true',
      expires_at: `gte.${now}`,
      select: '*'
    });

    const accessResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_access?${accessParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!accessResponse.ok) {
      console.error('[Payment Status] Failed to check access', {
        status: accessResponse.status
      });
      return res.status(500).json({ error: 'Failed to check access' });
    }

    const accessData = await accessResponse.json();
    const hasAccess = Array.isArray(accessData) && accessData.length > 0;
    const activeAccess = hasAccess ? accessData[0] : null;

    // Step 3: Check for manual access (admin bypass)
    // Using Supabase's filter syntax for OR condition
    const manualParams = new URLSearchParams({
      user_id: `eq.${user.id}`,
      is_active: 'eq.true',
      select: '*'
    });
    // Add OR condition for expires_at
    manualParams.append('or', `(expires_at.is.null,expires_at.gte.${now})`);

    const manualAccessResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_manual_access?${manualParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!manualAccessResponse.ok) {
      console.error('[Payment Status] Failed to check manual access', {
        status: manualAccessResponse.status
      });
      return res.status(500).json({ error: 'Failed to check manual access' });
    }

    const manualAccessData = await manualAccessResponse.json();
    const hasManualAccess = Array.isArray(manualAccessData) && manualAccessData.length > 0;
    const manualAccessRecord = hasManualAccess ? manualAccessData[0] : null;

    // Log for debugging
    const result = {
      userId: user.id,
      userEmail: user.email,
      userRole: user.user_metadata?.role,
      hasPaymentAccess: hasAccess,
      hasManualAccess: hasManualAccess,
      finalAccess: hasAccess || hasManualAccess,
      accessType: activeAccess?.access_type || (hasManualAccess ? 'manual' : 'none'),
      accessExpires: activeAccess?.expires_at || manualAccessRecord?.expires_at || null
    };

    console.log('[Payment Status] Access check result:', result);

    // Step 4: Return the combined access status
    return res.status(200).json({
      hasActiveAccess: hasAccess || hasManualAccess,
      accessType: activeAccess?.access_type || (hasManualAccess ? 'manual' : null),
      expiresAt: activeAccess?.expires_at || manualAccessRecord?.expires_at || null,
      hasManualAccess: hasManualAccess,
      manualAccessExpiresAt: manualAccessRecord?.expires_at || null
    });

  } catch (error) {
    console.error('[Payment Status] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
