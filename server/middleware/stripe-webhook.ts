import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Webhook secret from Stripe CLI or Dashboard
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Supabase client for server-side operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for admin operations
);

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) return;

  console.log(`Checkout completed for user: ${userId}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  const customerId = subscription.customer as string;

  // Get user ID from customer if not in metadata
  let finalUserId = userId;
  if (!finalUserId) {
    const { data: customerData } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    finalUserId = customerData?.user_id;
  }

  if (!finalUserId) return;

  // Get product ID from price
  const priceId = subscription.items.data[0]?.price.id;
  let productId = '';

  if (priceId) {
    const price = await stripe.prices.retrieve(priceId);
    productId = price.product as string;
  }

  // Insert subscription record
  await supabase.from('subscriptions').insert({
    user_id: finalUserId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    stripe_product_id: productId,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  });

  console.log(`Subscription created: ${subscription.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Get product ID from price
  const priceId = subscription.items.data[0]?.price.id;
  let productId = '';

  if (priceId) {
    const price = await stripe.prices.retrieve(priceId);
    productId = price.product as string;
  }

  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      stripe_price_id: priceId,
      stripe_product_id: productId,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription updated: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Update subscription status to cancelled
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log(`Subscription cancelled: ${subscription.id}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Get user from customer
  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!customerData?.user_id) return;

  // Record payment
  await supabase.from('payments').insert({
    user_id: customerData.user_id,
    stripe_payment_id: invoice.id,
    stripe_customer_id: customerId,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    description: `Invoice ${invoice.number}`,
    paid_at: new Date().toISOString(),
  });

  console.log(`Invoice paid: ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Get user from customer
  const { data: customerData } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (!customerData?.user_id) return;

  // Record failed payment
  await supabase.from('payments').insert({
    user_id: customerData.user_id,
    stripe_payment_id: invoice.id,
    stripe_customer_id: customerId,
    amount: invoice.amount_due,
    currency: invoice.currency,
    status: 'failed',
    description: `Invoice ${invoice.number} - Payment Failed`,
    paid_at: new Date().toISOString(),
  });

  console.log(`Payment failed for invoice: ${invoice.id}`);
}

export async function handleWebhook(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature - req.body must be raw buffer
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
