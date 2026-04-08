const prisma = require("../../config/prisma");
const StreamChat = require("stream-chat").StreamChat;



exports.onboard = async (userId, { name, phone, region, category, experience, portfolioUrl, price, type, about, profilePicture }) => {

    await prisma.user.update({
        where: { id: userId },
        data: { name, phone, region, profilePicture },
    });

    await prisma.vendor.update({
        where: { userId },
        data: { category, experience, portfolioUrl, price, type, about },
    });

    const serverClient = StreamChat.getInstance(
        process.env.STREAM_CHAT_API_KEY,
        process.env.STREAM_CHAT_API_SECRET,
    );

    await serverClient.upsertUser({
        id: userId,
        name: name,
        image: profilePicture,
    });
};
