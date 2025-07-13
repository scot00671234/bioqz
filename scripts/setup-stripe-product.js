#!/usr/bin/env node

/**
 * Stripe Product Setup Script
 * This script creates the bioqz Pro subscription product and price in Stripe
 * Run this once before deploying to production
 */

import Stripe from 'stripe';

async function setupStripeProduct() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    console.log('🚀 Setting up bioqz Pro subscription product...');

    // Create the bioqz Pro product
    const product = await stripe.products.create({
      name: 'bioqz Pro',
      description: 'Unlimited links, custom themes, and advanced analytics for your bio page',
      metadata: {
        service: 'bioqz',
        tier: 'pro'
      }
    });

    console.log('✅ Product created:', product.id);

    // Create the monthly price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 900, // $9.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        service: 'bioqz',
        tier: 'pro'
      }
    });

    console.log('✅ Monthly price created:', price.id);

    console.log('\n📝 Add this to your environment variables:');
    console.log(`STRIPE_PRICE_ID=${price.id}`);
    
    console.log('\n✅ Stripe product setup complete!');
    console.log('You can now accept bioqz Pro subscriptions at $9/month');

  } catch (error) {
    console.error('❌ Error setting up Stripe product:', error.message);
    process.exit(1);
  }
}

setupStripeProduct();