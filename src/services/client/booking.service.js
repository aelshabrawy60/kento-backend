const prisma = require("../../config/prisma");

/**
 * Create a new booking for a client
 * @param {Object} params
 * @param {string} params.userId - The ID of the authenticated user (client)
 * @param {string} params.packageId - The ID of the package being booked
 * @param {string} params.date - The requested service date (ISO string)
 */
exports.createBooking = async ({ userId, packageId, date }) => {
  try {
    // 1. Get client by userId
    const client = await prisma.client.findUnique({
      where: { userId },
    });
    if (!client) {
      const error = new Error("Client profile not found");
      error.statusCode = 404;
      throw error;
    }

    // 2. Get package and vendor
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
      include: { vendor: true },
    });
    if (!pkg) {
      const error = new Error("Package not found");
      error.statusCode = 404;
      throw error;
    }

    const vendor = pkg.vendor;
    if (!vendor) {
      const error = new Error("Vendor not found for this package");
      error.statusCode = 404;
      throw error;
    }

    // 3. Check if date is in vendor's unavailable days
    // Normalize requested date to start of day UTC for comparison
    const bookingDate = new Date(date);
    if (isNaN(bookingDate.getTime())) {
      const error = new Error("Invalid date format");
      error.statusCode = 400;
      throw error;
    }
    
    bookingDate.setUTCHours(0, 0, 0, 0);

    const isUnavailable = (vendor.unavailableDays || []).some((unavailableDate) => {
      const d = new Date(unavailableDate);
      d.setUTCHours(0, 0, 0, 0);
      return d.getTime() === bookingDate.getTime();
    });

    if (isUnavailable) {
      const error = new Error("The vendor is unavailable on the selected date");
      error.statusCode = 400;
      throw error;
    }

    // 4. Create booking
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        vendorId: vendor.id,
        packageId: pkg.id,
        serviceDate: bookingDate,
      },
      include: {
        package: true,
        vendor: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return booking;
  } catch (error) {
    console.error("Error creating booking in service:", error);
    throw error;
  }
};
