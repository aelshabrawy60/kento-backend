const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/client/auth.routes");
const vendorRoutes = require("./routes/vendor/auth.routes");
const vendorPackageRoutes = require("./routes/vendor/package.routes");
const vendorProfileRoutes = require("./routes/vendor/profile.routes");
const clientBookingRoutes = require("./routes/client/booking.routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/clients", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/vendors/packages", vendorPackageRoutes);
app.use("/api/vendors/profile", vendorProfileRoutes);
app.use("/api/clients/bookings", clientBookingRoutes);
app.use(errorHandler)


module.exports = app;