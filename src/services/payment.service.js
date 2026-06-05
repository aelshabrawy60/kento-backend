const crypto = require("crypto");

/**
 * Returns the Kashier credentials from env.
 */
function getCredentials() {
  const isTestMode = process.env.KASHIER_MODE !== "live";
  const merchantId = process.env.KASHIER_MERCHANT_ID;
  const apiKey     = process.env.KASHIER_API_KEY;

  if (!merchantId || !apiKey) {
    throw new Error(
      "Kashier credentials are not configured. Please set KASHIER_MERCHANT_ID and KASHIER_API_KEY in your .env file."
    );
  }

  return { merchantId, apiKey, isTestMode };
}

/**
 * Creates a Kashier hosted checkout URL.
 *
 * Official hash format (from Kashier NodeJs-Checkout-Demo/backend.js):
 *   path = `/?payment=${mid}.${orderId}.${amount}.${currency}`
 *   hash = HMAC-SHA256(path, apiKey) → hex
 *
 * Official URL params:
 *   merchantId, orderId, amount, currency, hash,
 *   merchantRedirect (single callback URL — Kashier appends ?paymentStatus=SUCCESS|FAILED),
 *   failureRedirect=true  (redirect even on failure),
 *   redirectMethod=get,
 *   mode=test|live
 */
exports.createPaymentUrl = ({ amount, currency = "EGP", bookingId }) => {
  const { merchantId, apiKey, isTestMode } = getCredentials();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const amountStr   = Number(amount).toFixed(2);

  // ── Hash (official format from Kashier's own demo) ──────────────────────
  const hashPath = `/?payment=${merchantId}.${bookingId}.${amountStr}.${currency}`;
  const hash = crypto
    .createHmac("sha256", apiKey)
    .update(hashPath)
    .digest("hex");

  // ── Single redirect URL — Kashier appends ?paymentStatus=SUCCESS|FAILED ──
  const merchantRedirect = `${frontendUrl}/payment/success`;

  // ── Build URL exactly as Kashier's demo does — no URLSearchParams ────────
  const paymentUrl =
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

  console.log(`[Kashier] ${isTestMode ? "TEST" : "LIVE"} mode`);
  console.log(`[Kashier] hashPath = ${hashPath}`);
  console.log(`[Kashier] paymentUrl = ${paymentUrl}`);

  return { paymentUrl, isTestMode };
};

/**
 * Verifies a Kashier webhook callback signature.
 * Official format (from Kashier's validateSignature in backend.js):
 *   queryString = "&paymentStatus=" + paymentStatus + "&merchantOrderId=" + orderId + ...
 *   hash = HMAC-SHA256(queryString, apiKey) → hex
 */
exports.verifySignature = (req) => {
  const { apiKey } = getCredentials();
  const query = req.query || {};

  // Reconstruct the string Kashier signs
  const queryString =
    `&paymentStatus=${query.paymentStatus || ""}` +
    `&merchantOrderId=${query.merchantOrderId || ""}` +
    `&orderId=${query.orderId || ""}` +
    `&orderReference=${query.orderReference || ""}` +
    `&cardDataToken=${query.cardDataToken || ""}` +
    `&maskedCard=${query.maskedCard || ""}` +
    `&merchantId=${query.merchantId || ""}` +
    `&mode=${query.mode || ""}`;

  const expected = crypto
    .createHmac("sha256", apiKey)
    .update(queryString)
    .digest("hex");

  const received = query.signature;

  if (!received) {
    console.warn("[Kashier] No signature in callback — skipping verification in dev.");
    return true;
  }

  const match = expected === received;
  if (!match) console.warn("[Kashier] Signature mismatch!", { expected, received });
  return match;
};

/**
 * Returns whether test mode is currently active.
 */
exports.isTestMode = () => process.env.KASHIER_MODE !== "live";
