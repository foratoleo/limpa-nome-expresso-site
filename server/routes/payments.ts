import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/payments/status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check for active access
    const { data: access, error } = await supabase
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

    // Check for manual access
    const { data: manualAccess, error: manualError } = await supabase
      .from('user_manual_access')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
      .maybeSingle();

    if (process.env.NODE_ENV === 'development') {
      console.log('[Payments API] Manual access check:', {
        userId: user.id,
        hasManualAccess: !!manualAccess,
        manualAccessExpiresAt: manualAccess?.expires_at,
        hasPaymentAccess: !!access,
        finalAccess: !!access || !!manualAccess,
      });
    }

    return res.status(200).json({
      hasActiveAccess: !!access || !!manualAccess,
      accessType: access?.access_type || 'manual',
      expiresAt: access?.expires_at || manualAccess?.expires_at || null,
      hasManualAccess: !!manualAccess,
      manualAccessExpiresAt: manualAccess?.expires_at || null,
    });
  } catch (error) {
    console.error('Error in /status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
});

export { router as paymentsRouter };
