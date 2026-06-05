const crypto = require("crypto");

/**
 * Returns the Kashier credentials from env.
 *
 * KASHIER_MERCHANT_ID    — your MID (e.g. MID-36345-985)
 * KASHIER_API_KEY        — Payment API Key (for HMAC hash, from Dashboard → Integrate now → API Keys)
 * KASHIER_SECRET_KEY     — Secret Key (for Payment Sessions API, from Dashboard → Integrate now → Secret Key)
 * KASHIER_MODE           — "test" | "live"
 */
function getCredentials() {
  const modeVal     = (process.env.KASHIER_MODE || "").trim();
  const isTestMode  = modeVal !== "live";
  const merchantId  = (process.env.KASHIER_MERCHANT_ID || "").trim();
  const apiKey      = (process.env.KASHIER_API_KEY || "").trim();      // Payment API Key (HMAC hash)
  const rawSecret   = (process.env.KASHIER_SECRET_KEY || "").trim();
  const secretKey   = rawSecret || undefined; // treat empty string as undefined

  if (!merchantId || !apiKey) {
    throw new Error(
      "Kashier credentials are not configured. " +
      "Please set KASHIER_MERCHANT_ID and KASHIER_API_KEY in your .env file."
    );
  }

  return { merchantId, apiKey, secretKey, isTestMode };
}

/**
 * Creates a Kashier payment URL.
 *
 * Uses the modern Payment Sessions API (v3) if KASHIER_SECRET_KEY is set,
 * otherwise falls back to the classic hash-based checkout URL.
 *
 * Sessions API docs: https://developers.kashier.io/payment/payment-sessions
 *   → POST https://test-api.kashier.io/v3/payment/sessions
 *   → Authorization: {{secret_key}}  (from Dashboard → Integrate now → Secret Key)
 *   → Returns: { sessionUrl: "https://payments.kashier.io/session/..." }
 *
 * Classic checkout (fallback):
 *   → https://checkout.kashier.io?merchantId=...&hash=...
 *   → hash = HMAC-SHA256("/?payment=mid.orderId.amount.currency", paymentApiKey)
 *
 * @param {object}  opts
 * @param {number}  opts.amount       - Order amount
 * @param {string}  [opts.currency]   - ISO code (default: "EGP")
 * @param {string}  opts.bookingId    - Your unique booking/order ID
 * @param {object}  [opts.customer]   - { name, email, phone }
 * @returns {Promise<{ paymentUrl: string, isTestMode: boolean }>}
 */
exports.createPaymentUrl = async ({ amount, currency = "EGP", bookingId, customer = null }) => {
  const { merchantId, apiKey, secretKey, isTestMode } = getCredentials();

  // Use Sessions API if the Secret Key is available
  if (secretKey) {
    return _createSessionUrl({ amount, currency, bookingId, customer, merchantId, apiKey, secretKey, isTestMode });
  }

  // Fall back to classic hash-based checkout URL
  return _createClassicUrl({ amount, currency, bookingId, customer, merchantId, apiKey, isTestMode });
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Payment Sessions API (v3) — modern approach                               */
/* ─────────────────────────────────────────────────────────────────────────── */

async function _createSessionUrl({ amount, currency, bookingId, customer, merchantId, apiKey, secretKey, isTestMode }) {
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").trim();
  const backendUrl  = (process.env.BACKEND_URL  || "http://localhost:8080").trim();
  const amountStr   = String(Number(amount).toFixed(2));

  const apiBase = isTestMode
    ? "https://test-api.kashier.io"
    : "https://api.kashier.io";

  let merchantRedirect = `${frontendUrl}/payment/success`;
  let serverWebhook = `${backendUrl}/api/payments/callback`;

  // Kashier Sessions API strict URL validation workaround for local development:
  // Kashier rejects URLs with "localhost" and URLs with ports.
  if (merchantRedirect.includes("localhost") || merchantRedirect.match(/:\d+/)) {
    console.warn("[Kashier] Localhost/port detected in FRONTEND_URL. Kashier rejects these.");
    console.warn("[Kashier] Stripping port/localhost to pass validation. You may need to manually restore the port in your browser after payment, or use ngrok.");
    merchantRedirect = merchantRedirect.replace("localhost", "127.0.0.1").replace(/:\d+/, "");
  }
  if (serverWebhook.includes("localhost") || serverWebhook.match(/:\d+/)) {
    serverWebhook = serverWebhook.replace("localhost", "127.0.0.1").replace(/:\d+/, "");
  }

  const body = {
    merchantId,
    amount:           amountStr,
    currency,
    order:            bookingId,
    merchantRedirect: merchantRedirect,
    failureRedirect:  true,
    redirectMethod:   "get",
    display:          "en",
    allowedMethods:   "card,wallet",
    type:             "one-time",
    interactionSource: "ECOMMERCE",
    serverWebhook:    serverWebhook,
    description:      `Booking #${bookingId}`,
  };

  if (customer?.email) {
    body.customer = { email: customer.email, reference: bookingId };
  } else {
    // Kashier v3 requires customer
    body.customer = { email: "guest@example.com", reference: bookingId };
  }
  
  if (customer) {
    body.metaData = {
      "Customer Name":  customer.name  || "N/A",
      "Customer Email": customer.email || "N/A",
      "Customer Phone": customer.phone || "N/A",
    };
  }

  console.log(`[Kashier] Creating payment session — ${isTestMode ? "TEST" : "LIVE"} mode`);
  console.log(`[Kashier] order=${bookingId} amount=${amountStr} ${currency}`);

  const response = await fetch(`${apiBase}/v3/payment/sessions`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": secretKey,
      "api-key":       apiKey || secretKey,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {}

  if (!response.ok) {
    // If a session was already created for this order, Kashier returns 400 but includes the sessionUrl!
    if (data && (data.sessionUrl || data.response?.sessionUrl)) {
      const existingUrl = data.sessionUrl || data.response?.sessionUrl;
      console.log(`[Kashier] Session already exists for order ${bookingId}. Reusing sessionUrl.`);
      return { paymentUrl: existingUrl, isTestMode };
    }
    console.error("[Kashier] Session creation failed:", response.status, text);
    throw new Error(`Kashier session creation failed (${response.status}): ${text}`);
  }

  const sessionUrl = data?.sessionUrl || data?.response?.sessionUrl;

  if (!sessionUrl) {
    console.error("[Kashier] No sessionUrl in response:", data);
    throw new Error("Kashier did not return a sessionUrl");
  }

  console.log(`[Kashier] Session created → ${sessionUrl}`);
  return { paymentUrl: sessionUrl, isTestMode };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Classic hash-based checkout URL — works with Payment API Key only         */
/* ─────────────────────────────────────────────────────────────────────────── */

function _createClassicUrl({ amount, currency, bookingId, customer, merchantId, apiKey, isTestMode }) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const amountStr   = Number(amount).toFixed(2);

  // Official hash format (Kashier NodeJs-Checkout-Demo/backend.js):
  //   path = `/?payment=${mid}.${orderId}.${amount}.${currency}`
  //   hash = HMAC-SHA256(path, paymentApiKey) → hex
  const hashPath = `/?payment=${merchantId}.${bookingId}.${amountStr}.${currency}`;
  const hash = crypto
    .createHmac("sha256", apiKey)
    .update(hashPath)
    .digest("hex");

  const merchantRedirect = `${frontendUrl}/payment/success`;

  const metaData = customer
    ? JSON.stringify({
        "Customer Name":  customer.name  || "N/A",
        "Customer Email": customer.email || "N/A",
        "Customer Phone": customer.phone || "N/A",
      })
    : null;

  let paymentUrl =
    `https://checkout.kashier.io?` +
    `merchantId=${merchantId}` +
    `&orderId=${encodeURIComponent(bookingId)}` +
    `&amount=${amountStr}` +
    `&currency=${currency}` +
    `&hash=${hash}` +
    `&merchantRedirect=${encodeURIComponent(merchantRedirect)}` +
    `&failureRedirect=true` +
    `&redirectMethod=get` +
    `&mode=${isTestMode ? "test" : "live"}`;

  if (metaData) {
    paymentUrl += `&metaData=${encodeURIComponent(metaData)}`;
  }

  console.log(`[Kashier] Classic checkout — ${isTestMode ? "TEST" : "LIVE"} mode`);
  console.log(`[Kashier] order=${bookingId} amount=${amountStr} ${currency}`);
  console.log(`[Kashier] merchantRedirect=${merchantRedirect}`);

  return { paymentUrl, isTestMode };
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Webhook signature verification                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Verifies a Kashier webhook POST body signature.
 *
 * For v3 webhooks, it looks for req.body.data.signatureKeys, sorts them alphabetically,
 * URL-encodes the values, joins them into a query string, and hashes with the API key.
 *
 * @param {import('express').Request} req
 * @returns {boolean}
 */
exports.verifyWebhookSignature = (req) => {
  const { apiKey } = getCredentials();

  const raw  = req.body || {};
  const data = raw.data || raw.obj || raw;

  const received = req.headers["x-kashier-signature"] || data.signature || raw.signature;
  if (!received) {
    console.warn("[Kashier] No signature in webhook headers/body — skipping verification.");
    return true;
  }

  // Check if this is a v3 webhook event with signatureKeys
  if (data && Array.isArray(data.signatureKeys)) {
    // Sort keys alphabetically
    const keys = [...data.signatureKeys].sort();
    
    // Construct the payload string: key1=encodedValue1&key2=encodedValue2
    const parts = [];
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== null) {
        // As per Kashier docs: only the values of the keys are URL-encoded
        parts.push(`${key}=${encodeURIComponent(data[key])}`);
      }
    }
    const signaturePayload = parts.join("&");

    const expected = crypto
      .createHmac("sha256", apiKey)
      .update(signaturePayload)
      .digest("hex");

    const match = _timingSafeEqual(expected, received);
    if (!match) {
      console.warn("[Kashier] V3 Webhook signature mismatch!", { expected, received, signaturePayload });
    }
    return match;
  }

  const queryString =
    `&paymentStatus=${data.paymentStatus   || ""}` +
    `&merchantOrderId=${data.merchantOrderId || ""}` +
    `&orderId=${data.orderId             || ""}` +
    `&orderReference=${data.orderReference || ""}` +
    `&cardDataToken=${data.cardDataToken  || ""}` +
    `&maskedCard=${data.maskedCard       || ""}` +
    `&merchantId=${data.merchantId       || ""}` +
    `&mode=${data.mode                || ""}`;

  const expected = crypto
    .createHmac("sha256", apiKey)
    .update(queryString)
    .digest("hex");

  const match = _timingSafeEqual(expected, received);
  if (!match) {
    console.warn("[Kashier] Webhook signature mismatch!", { expected, received });
  }
  return match;
};

function _timingSafeEqual(a, b) {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return a === b;
  }
}

exports.isTestMode = () => process.env.KASHIER_MODE !== "live";
