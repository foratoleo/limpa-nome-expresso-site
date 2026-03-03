import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
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

    // Create Supabase client with the user's token
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get user with the authenticated client
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Create admin client for database operations
    const adminSupabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check for active access
    const { data: access, error } = await adminSupabase
      .from('user_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Error checking access:', error);
      return res.status(500).json({ error: 'Failed to check access' });
    }

    return res.status(200).json({
      hasActiveAccess: !!access,
      accessType: access?.access_type || null,
      expiresAt: access?.expires_at || null,
    });
  } catch (error) {
    console.error('Error in /status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json(
      { error: 'Internal server error', details: errorMessage }
    );
  }
}
