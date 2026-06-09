const express = require("express");
const router = express.Router();

const { login, refresh, logout, verifyToken } = require("../../controllers/admin/auth.controller");

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/verify", verifyToken);

module.exports = router;
