const prisma = require("../../config/prisma");


exports.addReview = async ({ userId, vendorId, value, comment, mediaUrls }) => {


    // get the clientId from the userId
    const client = await prisma.client.findUnique({
        where: {
            userId
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
    return await prisma.review.create({
        data: {
            clientId,
            vendorId,
            value,
            comment,
            mediaUrls,
            rater: "CLIENT",
            raterName: client.user.name
        }
    });
}   