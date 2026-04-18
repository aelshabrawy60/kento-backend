const express = require("express");
const router = express.Router();

// check auth middleware
const authenticate = require("../../middlewares/auth.middleware");

const optionalAuth = require("../../middlewares/optionalAuth.middleware")
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
const { getSavedPosts, savePost, unSavePost } = require("../../controllers/client/saves.controller");

router.post("/register", validate(registerSchema), register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/onboard", validate(onboardSchema), authenticate, role("CLIENT"), onboard);
router.get("/discover", discover)
router.get("/vendors/:vendorId", optionalAuth, getVendorById)
router.post("/reviews", authenticate, role("CLIENT"), addReview)
router.get("/saves", authenticate, role("CLIENT"), getSavedPosts)
router.post("/saves", authenticate, role("CLIENT"), savePost)
router.delete("/saves", authenticate, role("CLIENT"), unSavePost)

module.exports = router;