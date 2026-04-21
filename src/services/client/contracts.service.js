const prisma = require("../../config/prisma");

exports.getContracts = async ({ userId }) => {
    const client = await prisma.client.findUnique({
        where: {
            userId
        },
        select: {
            id: true
        }
    });
    return await prisma.contract.findMany({
        where: {
            clientId: client.id
        },
        include: {
            vendor: {
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true,
                            profilePicture: true,
                            region: true,
                        }
                    },
                    category: true,
                    price: true,
                }
            }
        }
    });
}

exports.createContract = async ({ userId, vendorId, description, title, price, deposit, startDate, deliveryDate }) => {
    const client = await prisma.client.findUnique({
        where: {
            userId
        },
        select: {
            id: true
        }
    });

    return await prisma.contract.create({
        data: {
            clientId: client.id,
            vendorId,
            description,
            title,
            price,
            deposit,
            startDate,
            deliveryDate
        }
    });
}

exports.getContractById = async ({ contractId }) => {
    return await prisma.contract.findUnique({
        where: {
            id: contractId
        },
        include: {
            vendor: {
                select: {
                    id: true,
                    user: {
                        select: {
                            name: true,
                            profilePicture: true,
                            region: true,
                        }
                    },
                    category: true,
                    price: true,
                }
            }
        }
    });
}