const express = require("express");
const router = express.Router();

const {
  register,
  login,
  refresh,
  logout,
} = require("../../controllers/vendor/auth.controller");

const { onboard } = require("../../controllers/vendor/onboard.controller");
const { createPost } = require("../../controllers/vendor/posts.controller");

// check auth middleware
const authenticate  = require("../../middlewares/auth.middleware");
// check the role middleware
const role  = require("../../middlewares/role.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/onboard", authenticate, role("VENDOR"), onboard);
router.post("/posts", authenticate, role("VENDOR"), createPost);

module.exports = router;