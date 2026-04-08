

const { ProfileStatus } = require("@prisma/client");
const prisma = require("../../config/prisma");
const { ApiError } = require("../../utils/apiError");


exports.discover = async ({ category, region, priceRange }) => {
    try {
        // build the query based on the filters
        const where = {
            profileStatus: "APPROVED",
        };
        if (category) where.category = category;
        // the region filter is in the user table, so we need to join with the user table to filter by region
        if (region) where.user = { region };

        if (priceRange) {
            const [min, max] = priceRange.split("-").map(Number);
            where.price = { gte: min, lte: max };
        }
        // fetch vendors from the database based on the query
        // join with user table to get the vendor's name and profile picture
        const vendors = await prisma.vendor.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                        region: true,
                    },
                },
            },
        });
        return vendors;
    } catch (error) {
        console.error("Discover error:", error);
        throw new ApiError(500, "Failed to fetch vendors");
    }
};


exports.getVendorById = async (vendorId) => {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profilePicture: true,
                        region: true,
                    },
                },
                portfolioPosts: true,
                reviews: {
                    where: {
                        rater: "CLIENT"
                    }
                }
            },
        });

        return vendor;
    } catch (error) {
        console.error("Get vendor by ID error:", error);
        throw new ApiError(500, "Failed to fetch vendor");
    }
};