const bookingService = require("../../services/client/booking.service");

/**
 * Handle booking creation request
 */
exports.createBooking = async (req, res, next) => {
  try {
    const { packageId, date } = req.body;
    const userId = req.user.id; // Assuming user is attached by authenticate middleware

    if (!packageId || !date) {
      return res.status(400).json({
        success: false,
        message: "packageId and date are required",
      });
    }

    const booking = await bookingService.createBooking({
      userId,
      packageId,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error in createBooking controller:", error);
    
    // Handle specific status codes from service
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

/**
 * Get all bookings for the authenticated client
 */
exports.getBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookings = await bookingService.getBookings({ userId });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * Initiate Paymob payment for an ACCEPTED booking
 */
exports.payBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await bookingService.payBooking({ userId, bookingId: id });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || "Internal server error" });
  }
};
