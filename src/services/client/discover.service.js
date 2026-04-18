

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


exports.getVendorById = async ({ vendorId, userId }) => {

    let savedPostIds = [];

    if (userId) {
        // get the clientId from the userId
        const client = await prisma.client.findUnique({
            where: {
                userId: userId
            },
            select: {
                id: true,
                user: {
                    select: {
                        name: true
                    }
                }
            }
        });

        const clientId = client.id;
        // get user saved posts ids
        const savedPosts = await prisma.savedPost.findMany({
            where: {
                clientId: clientId
            },
            select: {
                postId: true
            }
        });

        console.log("saved posts", savedPosts)

        savedPostIds = savedPosts?.map((post) => post.postId);
    }



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

        // add isSaved to each portfolio post
        vendor.portfolioPosts.forEach((post) => {
            post.isSaved = savedPostIds.includes(post.id);
        });

        return vendor;
    } catch (error) {
        console.error("Get vendor by ID error:", error);
        throw new ApiError(500, "Failed to fetch vendor");
    }
};