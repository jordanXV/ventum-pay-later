const Shopify = require('shopify-api-node');
const fetch = require('node-fetch');

// Set up Shopify API credentials
const shopify = new Shopify({
  shopName: 'bike-theme-ventum',
  apiKey: 'f0f701c4182f1fe447f1fe503dfcdb68',
  password: '91e100f26f87194ca06e8b05297ca0bc'
});

// Listen for a manual payment event
shopify.on('payment/create', async (data) => {
  const payment = data.payment;
  
  // Check if the payment method is the one you want to use
  if (payment.gateway !== 'Ventum Now, Pay Later') {
    return;
  }
  
  // Get the order details
  const order = await shopify.order.get(payment.order_id);
  const orderId = order.id;
  const totalPrice = order.total_price;
  
  // Calculate the payment amount
  const paymentAmount = totalPrice * 0.5;
  
  // Generate the Checkout.com payment link
  const checkoutUrl = 'https://api.sandbox.checkout.com/payments/hosted';
  const payload = {
    amount: paymentAmount,
    currency: 'USD',
    description: `Payment for order ${orderId}`,
    reference: orderId,
    payment_type: 'regular',
    success_url: 'https://yourstorename.myshopify.com/success',
    failure_url: 'https://yourstorename.myshopify.com/failure'
  };
  const headers = {
    Authorization: 'sk_test_f3e21103-a20b-44fb-814e-56510f0fefc4'
  };
  const response = await fetch(checkoutUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: headers
  });
  const responseData = await response.json();
  
  // Extract the payment link from the Checkout.com response
  const paymentLink = responseData.links[0].href;
  
  // Open the payment link in a new window
  window.open(paymentLink);
});


