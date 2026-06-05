const prisma = require("../../config/prisma");

const BOOKING_INCLUDE = {
  client: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
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
      description: true,
    },
  },
};

/**
 * Get all bookings for the authenticated vendor
 */
exports.getBookings = async ({ userId }) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const error = new Error("Vendor profile not found");
    error.statusCode = 404;
    throw error;
  }

  return await prisma.booking.findMany({
    where: { vendorId: vendor.id },
    include: BOOKING_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Accept a booking (PENDING → ACCEPTED)
 */
exports.acceptBooking = async ({ userId, bookingId }) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const error = new Error("Vendor profile not found");
    error.statusCode = 404;
    throw error;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.vendorId !== vendor.id) {
    const error = new Error("Unauthorized to modify this booking");
    error.statusCode = 403;
    throw error;
  }

  if (booking.status !== "PENDING") {
    const error = new Error("Only PENDING bookings can be accepted");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "ACCEPTED" },
    include: BOOKING_INCLUDE,
  });
};

/**
 * Reject a booking (PENDING → REJECTED)
 */
exports.rejectBooking = async ({ userId, bookingId }) => {
  const vendor = await prisma.vendor.findUnique({ where: { userId } });
  if (!vendor) {
    const error = new Error("Vendor profile not found");
    error.statusCode = 404;
    throw error;
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.vendorId !== vendor.id) {
    const error = new Error("Unauthorized to modify this booking");
    error.statusCode = 403;
    throw error;
  }

  if (booking.status !== "PENDING") {
    const error = new Error("Only PENDING bookings can be rejected");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "REJECTED" },
    include: BOOKING_INCLUDE,
  });
};
