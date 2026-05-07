const express = require("express");
const router = express.Router();

const {
  createPackage,
  getPackages,
  updatePackage,
  deletePackage,
} = require("../../controllers/vendor/package.controller");

const authenticate = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

// Protect all routes with authenticate and role("VENDOR")
router.use(authenticate, role("VENDOR"));

router.get("/", getPackages);
router.post("/", createPackage);
router.put("/:id", updatePackage);
router.delete("/:id", deletePackage);

module.exports = router;
