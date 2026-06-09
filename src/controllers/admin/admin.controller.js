const adminService = require("../../services/admin/admin.service");

exports.getVendors = async (req, res) => {
  try {
    const vendors = await adminService.getAllVendors();
    res.json({ success: true, data: vendors });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await adminService.getAllBookings();
    res.json({ success: true, data: bookings });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

exports.approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await adminService.approveVendor(id);
    res.json({ success: true, message: "Vendor approved", data: vendor });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};

exports.rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await adminService.rejectVendor(id);
    res.json({ success: true, message: "Vendor rejected", data: vendor });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
};
