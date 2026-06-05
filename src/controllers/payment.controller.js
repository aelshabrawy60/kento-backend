const prisma = require("../config/prisma");
const paymentService = require("../services/payment.service");

/**
 * Handle Kashier payment callback/webhook
 * Kashier sends a POST request when a transaction is completed
 */
exports.handleCallback = async (req, res) => {
  try {
    const body = req.body;

    // Verify HMAC signature to ensure the request is from Kashier
    const isValid = paymentService.verifySignature(req);
    if (!isValid) {
      console.warn("Kashier callback: HMAC verification failed");
      // Still return 200 to prevent Kashier retrying — but don't update DB
      return res.status(200).json({ received: true });
    }

    const obj = body.obj || body.data || body;
    const success = obj.paymentStatus === "SUCCESS" || obj.success === true || obj.success === "true";
    const bookingId = obj.orderId || obj.merchantOrderId || obj.merchant_order_id;

    if (!bookingId) {
      console.warn("Kashier callback: No booking ID found in payload");
      return res.status(200).json({ received: true });
    }

    if (success) {
      // Update booking status to PAID
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "PAID" },
      });
      console.log(`Booking ${bookingId} marked as PAID via Kashier webhook`);
    } else {
      console.log(`Kashier callback: Payment failed for booking ${bookingId}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling Kashier callback:", error);
    // Always return 200 so Kashier doesn't retry endlessly
    res.status(200).json({ received: true });
  }
};
