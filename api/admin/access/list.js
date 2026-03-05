// Vercel serverless function for /api/admin/access/list
// Uses Supabase REST API directly (no package imports needed)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
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
      console.error('[Admin Access List] Missing Supabase configuration', {
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
      console.error('[Admin Access List] Auth failed', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      });
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    const adminUser = await userResponse.json();
    if (!adminUser || !adminUser.id) {
      console.error('[Admin Access List] Invalid user response');
      return res.status(401).json({ error: 'Unauthorized: Invalid user' });
    }

    // Step 3: Verify admin role
    const userRole = adminUser.user_metadata?.role;
    if (userRole !== 'admin') {
      console.error('[Admin Access List] Forbidden: User is not admin', {
        userId: adminUser.id,
        role: userRole
      });
      return res.status(403).json({
        error: 'Forbidden: Admin access required',
        details: `User role is '${userRole || 'undefined'}', expected 'admin'`
      });
    }

    console.log('[Admin Access List] Admin verified', {
      adminId: adminUser.id,
      email: adminUser.email
    });

    // Step 4: Extract search parameter from query string
    const { search } = req.query;

    // Step 5: Get all manual access records using Supabase REST API
    const accessesParams = new URLSearchParams({
      select: '*',
      order: 'granted_at.desc'
    });

    const accessesResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_manual_access?${accessesParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!accessesResponse.ok) {
      console.error('[Admin Access List] Failed to fetch manual access list', {
        status: accessesResponse.status
      });
      return res.status(500).json({ error: 'Failed to fetch access list' });
    }

    const accesses = await accessesResponse.json();

    // Step 6: Get all users to fetch emails using Supabase Admin API
    const usersListResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (!usersListResponse.ok) {
      console.error('[Admin Access List] Failed to fetch users', {
        status: usersListResponse.status
      });
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    const usersData = await usersListResponse.json();
    const users = usersData.users || [];

    // Step 7: Build user email map for enrichment
    const userEmails = new Map(
      users
        .map(u => [u.id, u.email])
        .filter(([id, email]) => id && email)
    );

    // Step 8: Calculate user status helper function
    function calculateUserStatus(access) {
      const now = new Date();
      const expiresAt = access.expires_at ? new Date(access.expires_at) : null;

      // Check if access is revoked
      if (access.revoked_at) {
        return 'expired';
      }

      // Check if access is inactive
      if (!access.is_active) {
        return 'expired';
      }

      // Check if access has expired
      if (expiresAt && expiresAt < now) {
        return 'expired';
      }

      // Active manual access
      return 'manual';
    }

    // Step 9: Enrich access data with emails and calculated status
    let enrichedAccesses = (accesses || []).map(access => ({
      ...access,
      user_email: userEmails.get(access.user_id) || null,
      granter_email: access.granted_by === adminUser.id
        ? adminUser.email
        : userEmails.get(access.granted_by) || null,
      status: calculateUserStatus(access)
    }));

    // Step 10: Apply search filter if provided
    if (search && typeof search === 'string' && search.trim()) {
      const searchLower = search.toLowerCase().trim();

      enrichedAccesses = enrichedAccesses.filter(access => {
        // Check email match
        if (access.user_email?.toLowerCase().includes(searchLower)) {
          return true;
        }

        // Check user metadata name match
        const user = users.find(u => u.id === access.user_id);
        const userName = user?.user_metadata?.name;
        if (userName && typeof userName === 'string' && userName.toLowerCase().includes(searchLower)) {
          return true;
        }

        return false;
      });
    }

    console.log('[Admin Access List] Returning accesses', {
      count: enrichedAccesses.length,
      searched: !!search
    });

    // Step 11: Return the enriched access list
    return res.status(200).json({ accesses: enrichedAccesses });

  } catch (error) {
    console.error('[Admin Access List] Unexpected error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
