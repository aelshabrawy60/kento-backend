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
 * @desc Initiate Paymob payment for an accepted booking
 * @access Private (Client)
 */
router.post(
  "/:id/pay",
  authenticate,
  role("CLIENT"),
  bookingController.payBooking
);

module.exports = router;

