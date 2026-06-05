const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

/**
 * @route  POST /api/payments/callback
 * @desc   Kashier Payment Webhook — called server-to-server when a transaction
 *         completes (success or failure). Configure this URL in the Kashier
 *         Merchant Dashboard under "Payment Webhook URL".
 *
 *         Flow:
 *         1. Kashier POSTs a JSON body with payment result
 *         2. We verify the HMAC signature (verifyWebhookSignature)
 *         3. On SUCCESS → update booking status to PAID
 *         4. Always respond 200 to acknowledge receipt
 *
 * @access Public (Kashier server-to-server call — verified by HMAC)
 */
router.post("/callback", paymentController.handleCallback);

module.exports = router;
