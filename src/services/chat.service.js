const prisma = require("../config/prisma");

exports.getConversations = async (userId) => {
    return await prisma.conversation.findMany({
        where: {
            participants: {
                some: { id: userId }
            }
        },
        include: {
            participants: {
                select: { id: true, name: true, profilePicture: true, role: true }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { updatedAt: 'desc' }
    });
};

exports.getConversationById = async (conversationId, userId) => {
    // Check if user is participant
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
            participants: {
                select: { id: true, name: true, profilePicture: true, role: true }
            }
        }
    });

    if (!conversation) return null;
    if (!conversation.participants.some(p => p.id === userId)) return null;

    return conversation;
};

exports.getOrCreateConversation = async (userId, targetUserId) => {
    // Look for existing conversation between these two users
    const existingConversations = await prisma.conversation.findMany({
        where: {
            AND: [
                { participants: { some: { id: userId } } },
                { participants: { some: { id: targetUserId } } }
            ]
        },
        include: {
            participants: {
                select: { id: true, name: true, profilePicture: true, role: true }
            }
        }
    });

    // We only want exact matches of 2 participants, but since it's 1-on-1 we can just check if any exists
    if (existingConversations.length > 0) {
        return existingConversations[0];
    }

    // Create new
    return await prisma.conversation.create({
        data: {
            participants: {
                connect: [{ id: userId }, { id: targetUserId }]
            }
        },
        include: {
            participants: {
                select: { id: true, name: true, profilePicture: true, role: true }
            }
        }
    });
};

exports.getMessages = async (conversationId, userId) => {
    // Verify participation
    const conversation = await this.getConversationById(conversationId, userId);
    if (!conversation) throw new Error("Unauthorized or conversation not found");

    return await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        include: {
            sender: {
                select: { id: true, name: true, profilePicture: true }
            }
        }
    });
};

exports.sendMessage = async (conversationId, senderId, content) => {
    const message = await prisma.message.create({
        data: {
            conversationId,
            senderId,
            content
        },
        include: {
            sender: {
                select: { id: true, name: true, profilePicture: true }
            }
        }
    });

    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });

    return message;
};
