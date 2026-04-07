
const discoverService = require("../../services/client/discover.service");
const { ApiError } = require("../../utils/apiError");

exports.discover = async (req, res) => {
    try {
        // get the query params
        const { category, region, priceRange } = req.query;
        // call the service to get the vendors based on the query params
        const vendors = await discoverService.discover({ category, region, priceRange });
        res.status(200).json(vendors);
    } catch (error) {
        throw new ApiError(500, "Failed to fetch vendors");
    }
};

exports.getVendorById = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const vendor = await discoverService.getVendorById(vendorId);
        if (!vendor) {
            throw new ApiError(404, "Vendor not found");
        }
        res.status(200).json(vendor);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(500, "Failed to fetch vendor");
    }
};