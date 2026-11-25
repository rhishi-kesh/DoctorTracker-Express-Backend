const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const authMiddleware = require("./middlewares/authMiddleware");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "Express API is running successfully!",
  });
});

app.use("/api/auth", authRoutes);

// User routes
app.use("/api/doctors", authMiddleware, doctorRoutes);
app.use("/api/patients", authMiddleware, patientRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;

// Connect database first, then start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
