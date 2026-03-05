import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create admin client with service role key
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      return res.status(500).json({ error: 'SUPABASE_URL not configured' });
    }

    const supabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('[PAYMENTS] User:', user.email);

    // Check for active access
    const { data: access } = await supabase
      .from('user_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    // Check for manual access
    const { data: manualAccess } = await supabase
      .from('user_manual_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
      .maybeSingle();

    console.log('[PAYMENTS] Access check:', {
      userId: user.id,
      hasManualAccess: !!manualAccess,
      finalAccess: !!access || !!manualAccess,
    });

    const finalResponse = {
      hasActiveAccess: !!access || !!manualAccess,
      hasManualAccess: !!manualAccess,
      manualAccessExpiresAt: manualAccess?.expires_at || null,
      accessType: access?.access_type || 'manual',
      expiresAt: access?.expires_at || manualAccess?.expires_at || null,
    };

    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error('[PAYMENTS] Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
