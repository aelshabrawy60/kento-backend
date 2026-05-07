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
