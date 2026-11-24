const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Express API is running successfully!"
    });
});

// User routes
app.use("/api/users", userRoutes);

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