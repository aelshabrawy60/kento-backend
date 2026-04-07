const prisma = require("../../config/prisma");



exports.onboard = async (userId, { name, phone, region }) => {
    // update user profile
    console.log("Onboarding user:", { userId, name, phone, region });
    await prisma.user.update({
        where: { id: userId },
        data: { name , phone, region },
    });
};
