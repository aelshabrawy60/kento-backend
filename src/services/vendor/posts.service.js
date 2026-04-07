const { tr } = require("zod/locales");
const prisma = require("../../config/prisma");

exports.createPost = async ({ userId, hashtags, mediaUrls }) => {
  try {
    // get the vendor Id
    const vendor = await prisma.vendor.findUnique(
        {
            select: {id: true},
            where: {userId: userId}
        }
    )
    const vendorId = vendor.id
    console.log("VendorId", vendorId)

    const post = await prisma.portfolioPost.create({
      data: {
        vendorId: vendorId,
        hashtags: hashtags || [],
        mediaUrls: mediaUrls || []
      }
    });

    return post;
  } catch (error) {
    console.error("Error creating post in service:", error);
    throw error;
  }
};