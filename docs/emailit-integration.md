# Environment Variables

This document describes all environment variables used in the project.

## Supabase Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key (safe for client-side) | Yes |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, never expose to client) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Alias for service role key (used by server) | Yes |

## EmailIt API Configuration

EmailIt is used for transactional email sending. Sign up at [emailit.com](https://emailit.com) to get your API key.

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `EMAILIT_API_KEY` | EmailIt API key for authentication | Yes (for emails) | `em_live_abc123...` |
| `EMAILIT_DEFAULT_FROM` | Default sender email address (must be from verified domain) | Yes | `noreply@yourdomain.com` |

### Getting Your EmailIt API Key

1. Log in to your EmailIt account at [emailit.com](https://emailit.com)
2. Navigate to **Settings** > **API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "Production Server")
5. Copy the key immediately (it won't be shown again)
6. Add it to your `.env.local` file

### Verifying Your Sending Domain

Before sending emails, you must verify your domain:

1. Go to **Settings** > **Sending Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Add the required DNS records to your domain:
   - SPF record
   - DKIM record
   - DMARC record (recommended)
4. Wait for verification (usually takes a few minutes to hours)

## Stripe Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe publishable key (client-side) | Yes |

## Server Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Example .env.local File

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# EmailIt API
EMAILIT_API_KEY=em_live_your_api_key_here
EMAILIT_DEFAULT_FROM=noreply@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# Server
PORT=3000
NODE_ENV=development
```

## Security Notes

1. **Never commit `.env.local`** to version control
2. **Service role keys** must never be exposed to the client
3. **EmailIt API key** should be kept secret and rotated periodically
4. Use different API keys for development and production environments
5. In production, use environment variables from your hosting platform (Vercel, Railway, etc.)

## EmailIt API Reference

- **Base URL**: `https://api.emailit.com/v2`
- **Send Email Endpoint**: `POST /emails`
- **Authentication**: Bearer token in Authorization header
- **Documentation**: https://emailit.com/docs/api-reference/emails/send

### Rate Limits

- Free tier: 100 emails/day
- Paid tiers: Higher limits available
- Rate limit headers included in API responses

### Email Status Tracking

EmailIt provides webhook events for:
- `email.sent` - Email was sent
- `email.delivered` - Email was delivered
- `email.opened` - Email was opened
- `email.clicked` - Link in email was clicked
- `email.bounced` - Email bounced
- `email.complained` - Recipient marked as spam
