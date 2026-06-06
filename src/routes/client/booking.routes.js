const express = require("express");
const router = express.Router();

const authenticate = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const bookingController = require("../../controllers/client/booking.controller");

/**
 * @route POST /api/clients/bookings
 * @desc Create a new booking
 * @access Private (Client)
 */
router.post(
  "/",
  authenticate,
  role("CLIENT"),
  bookingController.createBooking
);

/**
 * @route GET /api/clients/bookings
 * @desc Get all bookings for the authenticated client
 * @access Private (Client)
 */
router.get(
  "/",
  authenticate,
  role("CLIENT"),
  bookingController.getBookings
);

/**
 * @route POST /api/clients/bookings/:id/pay
 * @desc Initiate Kashier payment (10% deposit) for an accepted booking
 * @access Private (Client)
 */
router.post(
  "/:id/pay",
  authenticate,
  role("CLIENT"),
  bookingController.payBooking
);

/**
 * @route PATCH /api/clients/bookings/:id/complete
 * @desc Client confirms the booking is completed (IN_PROGRESS → COMPLETED)
 * @access Private (Client)
 */
router.patch(
  "/:id/complete",
  authenticate,
  role("CLIENT"),
  bookingController.completeBooking
);

module.exports = router;
