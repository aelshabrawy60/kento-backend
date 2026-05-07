const prisma = require("../../config/prisma");

// Helper function to get vendor by userId
const getVendorByUserId = async (userId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { userId: userId },
    select: { id: true },
  });
  if (!vendor) {
    throw new Error("Vendor not found for the given user");
  }
  return vendor;
};

exports.createPackage = async ({ userId, packageData }) => {
  try {
    const vendor = await getVendorByUserId(userId);

    const newPackage = await prisma.package.create({
      data: {
        vendorId: vendor.id,
        name: packageData.name,
        description: packageData.description,
        price: parseInt(packageData.price),
        features: packageData.features || [],
        numPhotos: parseInt(packageData.numPhotos || 0),
        numVideos: parseInt(packageData.numVideos || 0),
        deliveryTime: parseInt(packageData.deliveryTime || 0),
      },
    });

    return newPackage;
  } catch (error) {
    console.error("Error creating package in service:", error);
    throw error;
  }
};


exports.getPackages = async (userId) => {
  try {
    const vendor = await getVendorByUserId(userId);

    const packages = await prisma.package.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
    });

    return packages;
  } catch (error) {
    console.error("Error fetching packages in service:", error);
    throw error;
  }
};

exports.updatePackage = async ({ userId, packageId, packageData }) => {
  try {
    const vendor = await getVendorByUserId(userId);

    // Verify ownership
    const existingPackage = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!existingPackage) {
      throw new Error("Package not found");
    }

    if (existingPackage.vendorId !== vendor.id) {
      throw new Error("Unauthorized to update this package");
    }

    const updatedPackage = await prisma.package.update({
      where: { id: packageId },
      data: {
        name: packageData.name !== undefined ? packageData.name : undefined,
        description: packageData.description !== undefined ? packageData.description : undefined,
        price: packageData.price !== undefined ? parseInt(packageData.price) : undefined,
        features: packageData.features !== undefined ? packageData.features : undefined,
        numPhotos: packageData.numPhotos !== undefined ? parseInt(packageData.numPhotos) : undefined,
        numVideos: packageData.numVideos !== undefined ? parseInt(packageData.numVideos) : undefined,
        deliveryTime: packageData.deliveryTime !== undefined ? parseInt(packageData.deliveryTime) : undefined,
      },
    });

    return updatedPackage;
  } catch (error) {
    console.error("Error updating package in service:", error);
    throw error;
  }
};

exports.deletePackage = async ({ userId, packageId }) => {
  try {
    const vendor = await getVendorByUserId(userId);

    // Verify ownership
    const existingPackage = await prisma.package.findUnique({
      where: { id: packageId },
    });

    if (!existingPackage) {
      throw new Error("Package not found");
    }

    if (existingPackage.vendorId !== vendor.id) {
      throw new Error("Unauthorized to delete this package");
    }

    await prisma.package.delete({
      where: { id: packageId },
    });

    return { message: "Package deleted successfully" };
  } catch (error) {
    console.error("Error deleting package in service:", error);
    throw error;
  }
};
