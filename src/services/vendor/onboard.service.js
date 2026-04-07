const prisma = require("../../config/prisma");



exports.onboard = async (userId, { name, phone, region, category, experience, portfolioUrl, price, type, about, profilePicture }) => {
   
    await prisma.user.update({
        where: { id: userId },
        data: { name , phone, region, profilePicture },
    });

    await prisma.vendor.update({
        where: { userId },
        data: { category, experience, portfolioUrl, price, type, about },
    });
};
