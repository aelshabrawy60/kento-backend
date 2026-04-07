const express = require("express");
const router = express.Router();

// check auth middleware
const authenticate = require("../../middlewares/auth.middleware");
// check the role middleware
const role = require("../../middlewares/role.middleware");

const { onboard } = require("../../controllers/client/onboard.controller");

const {
  register,
  login,
  refresh,
  logout,
} = require("../../controllers/client/auth.controller");
const { validate } = require("../../middlewares/validate.middleware");
const { registerSchema, onboardSchema } = require("../../validators/client/client.validator");
const { discover, getVendorById } = require("../../controllers/client/discover.controller");
const { addReview } = require("../../controllers/client/reviews.controller");


router.post("/register", validate(registerSchema), register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/onboard", validate(onboardSchema), authenticate, role("CLIENT"), onboard);
router.get("/discover", discover)
router.get("/vendors/:vendorId", getVendorById)
router.post("/reviews", authenticate, role("CLIENT"), addReview)

module.exports = router;