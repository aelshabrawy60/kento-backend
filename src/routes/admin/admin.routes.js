const express = require("express");
const router = express.Router();

const { getVendors, getBookings, approveVendor, rejectVendor } = require("../../controllers/admin/admin.controller");
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../../controllers/admin/category.controller");
const authenticate = require("../../middlewares/auth.middleware");
const role = require("../../middlewares/role.middleware");

// All admin data routes require authentication + ADMIN role
router.use(authenticate, role("ADMIN"));

router.get("/vendors", getVendors);
router.get("/bookings", getBookings);
router.patch("/vendors/:id/approve", approveVendor);
router.patch("/vendors/:id/reject", rejectVendor);

router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

module.exports = router;
