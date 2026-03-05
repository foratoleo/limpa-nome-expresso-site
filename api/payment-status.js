// Vercel serverless function for /api/payment-status
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
      console.error('Missing Supabase configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Step 1: Verify the user token using Supabase Auth REST API
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey
      }
    });

    if (!userResponse.ok) {
      console.error('Auth failed:', userResponse.status, userResponse.statusText);
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await userResponse.json();
    if (!user || !user.id) {
      return res.status(401).json({ error: 'Invalid user' });
    }

    console.log('[Payment Status] User verified:', user.email);

    // Step 2: Check for active payment access
    const now = new Date().toISOString();
    const accessQuery = `
      user_id=eq.${user.id}&
      is_active=eq.true&
      expires_at=gte.${now}
      &select=*
    `.replace(/\s+/g, '');

    const accessResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_access?${accessQuery}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const accessData = await accessResponse.json();
    const hasAccess = Array.isArray(accessData) && accessData.length > 0;
    const activeAccess = hasAccess ? accessData[0] : null;

    // Step 3: Check for manual access (admin bypass)
    const manualAccessQuery = `
      user_id=eq.${user.id}&
      is_active=eq.true&
      (expires_at.is.null,expires_at.gte.${now})
      &select=*
    `.replace(/\s+/g, '');

    const manualAccessResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_manual_access?${manualAccessQuery}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const manualAccessData = await manualAccessResponse.json();
    const hasManualAccess = Array.isArray(manualAccessData) && manualAccessData.length > 0;
    const manualAccessRecord = hasManualAccess ? manualAccessData[0] : null;

    // Log for debugging
    console.log('[Payment Status] Access check result:', {
      userId: user.id,
      userEmail: user.email,
      hasPaymentAccess: hasAccess,
      hasManualAccess: hasManualAccess,
      finalAccess: hasAccess || hasManualAccess,
      accessType: activeAccess?.access_type || (hasManualAccess ? 'manual' : 'none')
    });

    // Step 4: Return the combined access status
    return res.status(200).json({
      hasActiveAccess: hasAccess || hasManualAccess,
      accessType: activeAccess?.access_type || (hasManualAccess ? 'manual' : null),
      expiresAt: activeAccess?.expires_at || manualAccessRecord?.expires_at || null,
      hasManualAccess: hasManualAccess,
      manualAccessExpiresAt: manualAccessRecord?.expires_at || null
    });

  } catch (error) {
    console.error('[Payment Status] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
