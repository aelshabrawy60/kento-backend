require('dotenv').config();

async function test() {
  const secretKey = process.env.KASHIER_SECRET_KEY.trim();
  const apiKey = process.env.KASHIER_API_KEY.trim();
  const merchantId = process.env.KASHIER_MERCHANT_ID.trim();

  const body = {
    "merchantId": merchantId,
    "paymentType": "credit",
    "amount": "1.00",
    "currency": "EGP",
    "order": "testorder124",
    "merchantRedirect": "http://127.0.0.1:5173/payment/success",
    "serverWebhook": "http://127.0.0.1:8080/api/payments/callback",
    "display": "en",
    "type": "one-time",
    "allowedMethods": "card,wallet",
    "customer": {
      "email": "test@example.com",
      "reference": "ref124"
    }
  };

  console.log("Testing with body:", body);

  const response = await fetch("https://test-api.kashier.io/v3/payment/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": secretKey,
      "api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

test().catch(console.error);
