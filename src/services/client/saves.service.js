const prisma = require("../../config/prisma");


exports.getSavedPosts = async ({ userId }) => {

    const client = await prisma.client.findUnique({
        where: {
            userId: userId
        },
        select: {
            id: true
        }
    });

    const clientId = client.id;

    return await prisma.savedPost.findMany({
        where: {
            clientId
        },
        include: {
            post: {
                include: {
                    vendor: {
                        select: {
                            id: true,
                            category: true,
                            price: true,
                            user: {
                                select: {
                                    name: true,
                                    profilePicture: true,
                                    region: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    });
}

exports.savePost = async ({ userId, postId }) => {
    const client = await prisma.client.findUnique({
        where: {
            userId
        },
        select: {
            id: true
        }
    });

    const clientId = client.id;

    return await prisma.savedPost.create({
        data: {
            clientId,
            postId
        }
    });
}

exports.unSavePost = async ({ userId, postId }) => {
    const client = await prisma.client.findUnique({
        where: {
            userId
        },
        select: {
            id: true
        }
    });

    const clientId = client.id;

    console.log("clientId", clientId);
    console.log("postId", postId);

    return await prisma.savedPost.delete({
        where: {
            clientId_postId: {
                clientId,
                postId
            }
        }
    });
}