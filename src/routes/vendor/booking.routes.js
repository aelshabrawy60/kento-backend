const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");
const bookingController = require("../../controllers/vendor/booking.controller");

/**
 * @route GET /api/vendors/bookings
 * @desc Get all bookings for the authenticated vendor
 * @access Private (Vendor)
 */
router.get("/", authenticate, role("VENDOR"), bookingController.getBookings);

/**
 * @route PATCH /api/vendors/bookings/:id/accept
 * @desc Accept a booking
 * @access Private (Vendor)
 */
router.patch("/:id/accept", authenticate, role("VENDOR"), bookingController.acceptBooking);

/**
 * @route PATCH /api/vendors/bookings/:id/reject
 * @desc Reject a booking
 * @access Private (Vendor)
 */
router.patch("/:id/reject", authenticate, role("VENDOR"), bookingController.rejectBooking);

module.exports = router;
