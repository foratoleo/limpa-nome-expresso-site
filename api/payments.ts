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

    // Create admin client with service role key
    // Note: Serverless functions use non-VITE_ prefixed env vars
    const supabase: any = createClient(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from JWT using correct method
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      token
    );

    if (authError || !user) {
      console.log('[PAYMENTS DEBUG] Step 1 - Token verification FAILED:', {
        hasAuthError: !!authError,
        authErrorMessage: authError?.message,
        hasUser: !!user
      });
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('[PAYMENTS DEBUG] Step 1 - Token verified:', {
      tokenLength: token.length,
      userId: user.id
    });

    console.log('[PAYMENTS DEBUG] Step 2 - User found:', {
      userId: user.id,
      email: user.email,
      userMetadata: user.user_metadata
    });

    // Check for active access
    const { data: access, error } = await supabase
      .from('user_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    console.log('[PAYMENTS DEBUG] Step 3 - user_access result:', {
      found: !!access,
      error: error?.message,
      data: access
    });

    // Check for manual access
    const { data: manualAccess, error: manualError } = await supabase
      .from('user_manual_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
      .maybeSingle();

    console.log('[PAYMENTS DEBUG] Step 4 - user_manual_access result:', {
      found: !!manualAccess,
      error: manualError?.message,
      data: manualAccess
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('[Payments API] Manual access check:', {
        userId: user.id,
        hasManualAccess: !!manualAccess,
        manualAccessExpiresAt: manualAccess?.expires_at,
        hasPaymentAccess: !!access,
        finalAccess: !!access || !!manualAccess,
      });
    }

    if (error) {
      console.error('Error checking access:', error);
      return res.status(500).json({ error: 'Failed to check access' });
    }

    const finalResponse = {
      hasActiveAccess: !!access || !!manualAccess,
      hasManualAccess: !!manualAccess,
      manualAccessExpiresAt: manualAccess?.expires_at || null,
      accessType: access?.access_type || 'manual',
      expiresAt: access?.expires_at || manualAccess?.expires_at || null,
    };

    console.log('[PAYMENTS DEBUG] Step 5 - Final response:', {
      hasActiveAccess: finalResponse.hasActiveAccess,
      hasManualAccess: finalResponse.hasManualAccess,
      accessType: finalResponse.accessType,
      expiresAt: finalResponse.expiresAt
    });

    return res.status(200).json(finalResponse);
  } catch (error) {
    console.error('Error in /status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json(
      { error: 'Internal server error', details: errorMessage }
    );
  }
}
