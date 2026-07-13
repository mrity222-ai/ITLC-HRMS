const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Company = require('../models/Company');
const Payment = require('../models/Payment');

const Stripe = require('stripe');
const Razorpay = require('razorpay');

// Fallback keys so the app doesn't crash, but real keys should be provided in .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51MockStripeKey123456');

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_MockRazorpayID',
    key_secret: process.env.RAZORPAY_SECRET || 'MockRazorpaySecret',
  });
} catch(err) {
  console.log("Razorpay initialization warning", err.message);
}

// Create Stripe Session
router.post('/create-stripe-session', auth(['Company Admin']), async (req, res) => {
  try {
    const { planId, planName, amount, currency } = req.body;
    
    // In a real app, you would create a Stripe Checkout Session
    // Since we are mocking without valid API keys by default, we will return a simulated URL if mock keys are used
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('Mock')) {
       // Mock Mode
       return res.json({ 
         success: true, 
         url: `/payment-success?session_id=mock_session_${Date.now()}&gateway=stripe&planId=${planId}&amount=${amount}` 
       });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: planName },
          unit_amount: amount * 100, // Stripe expects cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      // Update success URL based on frontend host
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&gateway=stripe&planId=${planId}&amount=${amount}`,
      cancel_url: `${req.headers.origin}/admin`,
      client_reference_id: req.user.companyId
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Razorpay Order
router.post('/create-razorpay-order', auth(['Company Admin']), async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('Mock')) {
      // Mock Mode
      return res.json({
        success: true,
        orderId: `mock_order_${Date.now()}`,
        amount: amount * 100,
        currency,
        key: 'rzp_test_MockRazorpayID'
      });
    }

    const options = {
      amount: amount * 100, // Razorpay expects paise
      currency: currency,
      receipt: `rcptid_${req.user.companyId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify and Upgrade Subscription
router.post('/verify', auth(['Company Admin']), async (req, res) => {
  try {
    const { gateway, planId, paymentId, orderId, signature, amount } = req.body;
    const company = await Company.findByPk(req.user.companyId);

    // If Razorpay, you would verify signature using crypto here
    // If Stripe, session is verified via webhook or session_id query

    company.subscriptionPlanId = planId;
    company.status = 'active'; // Unlock the account
    
    // Set some dummy limits based on plan, real app would fetch from DB
    if (planId === 'starter') { company.maxEmployees = 50; company.storageLimit = 10; }
    else if (planId === 'professional') { company.maxEmployees = 250; company.storageLimit = 50; }
    else if (planId === 'business') { company.maxEmployees = 1000; company.storageLimit = 250; }
    else if (planId === 'enterprise') { company.maxEmployees = 99999; company.storageLimit = 1000; }
    else { company.maxEmployees = 10; company.storageLimit = 2; }

    await company.save();

    // Create Payment Record
    const payment = await Payment.create({
      id: paymentId || `pay_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      companyId: company.id,
      companyName: company.name,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: amount,
      gateway: gateway,
      status: 'successful',
      date: new Date().toISOString()
    });

    res.json({ success: true, company, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
