const prisma = require("../../config/prisma");

/**
 * Get all vendors with user details and stats
 */
exports.getAllVendors = async () => {
  const vendors = await prisma.vendor.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profilePicture: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          packages: true,
          bookings: true,
          reviews: true,
          portfolioPosts: true,
        },
      },
    },
    orderBy: { user: { createdAt: "desc" } },
  });
  return vendors;
};

/**
 * Get all bookings across the platform
 */
exports.getAllBookings = async () => {
  const bookings = await prisma.booking.findMany({
    include: {
      client: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profilePicture: true,
            },
          },
        },
      },
      vendor: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      },
      package: {
        select: {
          id: true,
          name: true,
          price: true,
          deliveryTime: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return bookings;
};

/**
 * Approve a vendor (set profileStatus to APPROVED)
 */
exports.approveVendor = async (vendorId) => {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw new Error("Vendor not found");

  return prisma.vendor.update({
    where: { id: vendorId },
    data: { profileStatus: "APPROVED" },
  });
};

/**
 * Reject a vendor (set profileStatus to REJECTED)
 */
exports.rejectVendor = async (vendorId) => {
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw new Error("Vendor not found");

  return prisma.vendor.update({
    where: { id: vendorId },
    data: { profileStatus: "REJECTED" },
  });
};
