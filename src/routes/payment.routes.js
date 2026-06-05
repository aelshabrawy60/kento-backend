const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

/**
 * @route POST /api/payments/callback
 * @desc Kashier webhook — called when a transaction is completed
 * @access Public (Kashier server)
 */
router.post("/callback", paymentController.handleCallback);

module.exports = router;
