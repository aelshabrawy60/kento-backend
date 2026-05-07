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

module.exports = router;
