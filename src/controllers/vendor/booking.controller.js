const bookingService = require("../../services/vendor/booking.service");

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

exports.acceptBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const booking = await bookingService.acceptBooking({ userId, bookingId: id });
    res.status(200).json({ success: true, message: "Booking accepted", data: booking });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || "Internal server error" });
  }
};

exports.rejectBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const booking = await bookingService.rejectBooking({ userId, bookingId: id });
    res.status(200).json({ success: true, message: "Booking rejected", data: booking });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * Vendor signals that work is done — prompts client to confirm completion
 */
exports.requestCompletion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const booking = await bookingService.requestCompletion({ userId, bookingId: id });
    res.status(200).json({ success: true, message: "Completion request sent to client", data: booking });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || "Internal server error" });
  }
};

/**
 * Vendor directly marks a booking as COMPLETED
 */
exports.markComplete = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const booking = await bookingService.markComplete({ userId, bookingId: id });
    res.status(200).json({ success: true, message: "Booking marked as completed", data: booking });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message || "Internal server error" });
  }
};
