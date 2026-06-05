const prisma = require("../config/prisma");
const paymentService = require("../services/payment.service");

/**
 * Handle Kashier Payment Session webhook (POST).
 *
 * When using Payment Sessions API (v3), Kashier POSTs to `serverWebhook` URL
 * on every transaction event. The payload shape is:
 *
 *   {
 *     response: {
 *       result: "SUCCESS" | "FAILED",
 *       status: "SUCCESS" | "FAILED",
 *       order: { reference: "<your bookingId>", ... },
 *       merchantOrderId: "<your bookingId>",
 *       ...
 *     }
 *   }
 *
 * Security: We verify the HMAC signature and always respond 200 to stop retries.
 */
exports.handleCallback = async (req, res) => {
  try {
    const body = req.body;

    // Log the full payload in development for debugging
    if (process.env.NODE_ENV !== "production") {
      console.log("[Kashier] Webhook payload:", JSON.stringify(body, null, 2));
    }

    // Verify HMAC signature
    const isValid = paymentService.verifyWebhookSignature(req);
    if (!isValid) {
      console.warn("[Kashier] Webhook: HMAC verification failed — ignoring payload");
      return res.status(200).json({ received: true });
    }

    // ── Extract status & bookingId from Payment Sessions v3 format ──────────
    let status = "";
    let rawBookingId = "";

    if (body.event && body.data) {
      // Modern webhook format
      status = (body.data.status || "").toUpperCase();
      rawBookingId = body.data.merchantOrderId || body.data.orderReference;
      
      // We only want to process "pay" or "capture" events for successful payments
      if (body.event !== "pay" && body.event !== "capture") {
        console.log(`[Kashier] Webhook: ignoring event type "${body.event}"`);
        return res.status(200).json({ received: true });
      }
    } else {
      // Legacy fallback
      const responseObj = body.response || body;
      status = (
        responseObj.result         ||
        responseObj.status         ||
        responseObj.paymentStatus  ||
        ""
      ).toUpperCase();

      rawBookingId =
        responseObj.order?.reference   ||
        responseObj.merchantOrderId    ||
        responseObj.orderId            ||
        responseObj.merchant_order_id  ||
        body.orderId                   ||
        body.merchantOrderId;
    }

    const success = status === "SUCCESS";

    let bookingId = rawBookingId;
    if (rawBookingId && rawBookingId.includes("-")) {
      const parts = rawBookingId.split("-");
      if (parts.length > 5) {
        bookingId = parts.slice(0, 5).join("-");
      }
    }

    if (!bookingId) {
      console.warn("[Kashier] Webhook: No booking ID found in payload", body);
      return res.status(200).json({ received: true });
    }

    if (success) {
      // Confirm the booking is still in a payable state before updating
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (booking && booking.status === "ACCEPTED") {
        await prisma.booking.update({
          where: { id: bookingId },
          data:  { status: "PAID" },
        });
        console.log(`[Kashier] ✅ Booking ${bookingId} marked as PAID`);
      } else if (booking?.status === "PAID") {
        console.log(`[Kashier] Booking ${bookingId} already PAID — skipping`);
      } else {
        console.warn(`[Kashier] Booking ${bookingId} in unexpected state: ${booking?.status}`);
      }
    } else {
      console.log(`[Kashier] ❌ Payment ${status} for booking ${bookingId}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Kashier] Error handling webhook:", error);
    // Always return 200 so Kashier stops retrying
    res.status(200).json({ received: true });
  }
};
