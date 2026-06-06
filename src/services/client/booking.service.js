const prisma = require("../../config/prisma");
const paymentService = require("../payment.service");

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

const BOOKING_INCLUDE = {
  package: {
    select: {
      id: true,
      name: true,
      price: true,
      description: true,
      deliveryTime: true,
      numPhotos: true,
      numVideos: true,
    },
  },
  vendor: {
    include: {
      user: {
        select: {
          name: true,
          email: true,
          profilePicture: true,
          region: true,
        },
      },
    },
  },
};

/**
 * Get all bookings for the authenticated client
 */
exports.getBookings = async ({ userId }) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) {
    const error = new Error("Client profile not found");
    error.statusCode = 404;
    throw error;
  }

  return await prisma.booking.findMany({
    where: { clientId: client.id },
    include: BOOKING_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Initiate Kashier payment for an ACCEPTED booking.
 * Charges a 10% deposit of the package price.
 */
exports.payBooking = async ({ userId, bookingId }) => {
  // 1. Get client
  const client = await prisma.client.findUnique({
    where: { userId },
    include: {
      user: {
        select: { name: true, email: true, phone: true },
      },
    },
  });
  if (!client) {
    const error = new Error("Client profile not found");
    error.statusCode = 404;
    throw error;
  }

  // 2. Get booking with package
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { package: true },
  });

  if (!booking) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
  }

  if (booking.clientId !== client.id) {
    const error = new Error("Unauthorized to pay for this booking");
    error.statusCode = 403;
    throw error;
  }

  if (booking.status !== "ACCEPTED") {
    const error = new Error("Only ACCEPTED bookings can be paid");
    error.statusCode = 400;
    throw error;
  }

  // 3. Build billing data from client user
  const nameParts = (client.user.name || "").split(" ");
  const billingData = {
    firstName: nameParts[0] || "N/A",
    lastName: nameParts.slice(1).join(" ") || "N/A",
    email: client.user.email || "N/A",
    phone: client.user.phone || "N/A",
  };

  // 4. Calculate 10% deposit amount
  const fullPrice = booking.package.price;
  const depositAmount = Math.ceil(fullPrice * 0.10); // 10% deposit, rounded up

  const customer = {
    name:  billingData.firstName + (billingData.lastName !== "N/A" ? ` ${billingData.lastName}` : ""),
    email: billingData.email,
    phone: billingData.phone,
  };

  console.log(`[Booking] Charging 10% deposit: ${depositAmount} EGP (full price: ${fullPrice} EGP)`);

  const { paymentUrl, isTestMode } = await paymentService.createPaymentUrl({
    amount: depositAmount,
    currency: "EGP",
    bookingId: booking.id,
    customer,
  });

  // 5. Store the order ID on the booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentOrderId: booking.id },
  });

  return { paymentUrl, isTestMode, depositAmount, fullPrice };
};

/**
 * Client confirms the booking is completed (IN_PROGRESS → COMPLETED)
 */
exports.completeBooking = async ({ userId, bookingId }) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) {
    const error = new Error("Client profile not found");
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

  if (booking.clientId !== client.id) {
    const error = new Error("Unauthorized to complete this booking");
    error.statusCode = 403;
    throw error;
  }

  if (booking.status !== "IN_PROGRESS") {
    const error = new Error("Only IN_PROGRESS bookings can be completed");
    error.statusCode = 400;
    throw error;
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED" },
    include: BOOKING_INCLUDE,
  });
};
