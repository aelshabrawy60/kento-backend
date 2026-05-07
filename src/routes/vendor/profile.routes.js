const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/vendor/profile.controller");
const authenticate = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

router.get("/", authenticate, role("VENDOR"), profileController.getProfile);
router.put("/", authenticate, role("VENDOR"), profileController.updateProfile);

module.exports = router;
