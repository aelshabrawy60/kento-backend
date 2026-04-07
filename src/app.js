const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/client/auth.routes");
const vendorRoutes = require("./routes/vendor/auth.routes");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/clients", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use(errorHandler)


module.exports = app;