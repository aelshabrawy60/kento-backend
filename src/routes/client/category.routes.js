const express = require("express");
const router = express.Router();
const { getCategories } = require("../../controllers/admin/category.controller");

// Public route to fetch categories
router.get("/", getCategories);

module.exports = router;
