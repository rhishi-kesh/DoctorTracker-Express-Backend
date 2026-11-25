const Users = require("../models/Users");
const asyncHandler = require("../utils/asyncHandler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/auth/create-user
const createUser = asyncHandler(async (req, res) => {
    // Check setup secret
    const setupSecret = req.headers["x-setup-secret"];

    if (!setupSecret || setupSecret !== process.env.SETUP_SECRET) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized user creation"
        });
    }

    // Allow creation only when no user exists
    const userCount = await Users.countDocuments();

    if (userCount > 0) {
        return res.status(403).json({
            success: false,
            message: "User creation is disabled"
        });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters"
        });
    }

    const user = await Users.create({
        name,
        email,
        password
    });

    res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and explicitly include password
    const user = await Users.findOne({
        email: email.toLowerCase().trim()
    }).select("+password");

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    // Generate JWT
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // Store JWT in HTTP-only cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            id: user._id,
            name: user.name,
            email: user.email,
            token
        }
    });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    });

    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    });
});

module.exports = {
    createUser,
    login,
    logout,
    getMe
};