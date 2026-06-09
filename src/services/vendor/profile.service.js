const prisma = require("../../config/prisma");

exports.getProfile = async (userId) => {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            vendor: true
        }
    });
};

exports.updateProfile = async (userId, data) => {
    const { 
        name, 
        phone, 
        region, 
        profilePicture, 
        category, 
        about, 
        price, 
        experience, 
        portfolioUrl, 
        type, 
        topImageUrl,
        unavailableDays 
    } = data;

    // Filter out undefined values to only update what's provided
    const userData = {};
    if (name !== undefined) userData.name = name;
    if (phone !== undefined) userData.phone = phone;
    if (region !== undefined) userData.region = region;
    if (profilePicture !== undefined) userData.profilePicture = profilePicture;

    if (Object.keys(userData).length > 0) {
        await prisma.user.update({
            where: { id: userId },
            data: userData,
        });
    }

    const vendorData = {};
    if (category !== undefined) vendorData.category = category;
    if (about !== undefined) vendorData.about = about;
    if (price !== undefined) vendorData.price = price;
    if (experience !== undefined) vendorData.experience = experience;
    if (portfolioUrl !== undefined) vendorData.portfolioUrl = portfolioUrl;
    if (type !== undefined) vendorData.type = type;
    if (topImageUrl !== undefined) vendorData.topImageUrl = topImageUrl;
    if (unavailableDays !== undefined) vendorData.unavailableDays = unavailableDays;

    if (Object.keys(vendorData).length > 0) {
        await prisma.vendor.update({
            where: { userId },
            data: vendorData,
        });
    }

    // Return the updated user and vendor
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            vendor: true
        }
    });
};
