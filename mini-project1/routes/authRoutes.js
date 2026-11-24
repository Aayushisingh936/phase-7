import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
// import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        const normalizeEmail = email.trim().toLowerCase();

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail) ||
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message:
                "Enter a valid email and a password of 8–72 UTF-8 bytes",
            });
        }

        const existingUser = await User.findOne({
            email: normalizeEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            email: normalizeEmail,
            password: hashedPassword,
        })

            return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        console.error("Registration error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRIES_IN || "1h"}
        );

        return res.status(200).json({
            message: "login successful",
            token,
        });

    } catch (error) {
        console.error("Login error: error.message");

        return res.status(500).json({
            message: "Internal server error",
        });
    }
});

export default router;

























































































































































































































// const express = require("express");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const router = express.Router();

// // REGISTER
// router.post("/register", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (
//       typeof email !== "string" ||
//       typeof password !== "string" ||
//       !email.trim() ||
//       !password
//     ) {
//       return res.status(400).json({
//         message: "Email and password are required"
//       });
//     }

//     if (password.length < 8) {
//       return res.status(400).json({
//         message: "Password must be at least 8 characters"
//       });
//     }

//     const existingUser = await User.findOne({
//       email: email.trim().toLowerCase()
//     });

//     if (existingUser) {
//       return res.status(409).json({
//         message: "Email is already registered"
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       email: email.trim().toLowerCase(),
//       password: hashedPassword
//     });

//     return res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         id: user._id,
//         email: user.email
//       }
//     });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({
//         message: "Email is already registered"
//       });
//     }

//     console.error("Registration error:", error.message);

//     return res.status(500).json({
//       message: "Internal server error"
//     });
//   }
// });

// // LOGIN
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (
//       typeof email !== "string" ||
//       typeof password !== "string" ||
//       !email.trim() ||
//       !password
//     ) {
//       return res.status(400).json({
//         message: "Email and password are required"
//       });
//     }

//     const user = await User.findOne({
//       email: email.trim().toLowerCase()
//     });

//     if (!user) {
//       return res.status(401).json({
//         message: "Invalid email or password"
//       });
//     }

//     const isPasswordValid = await bcrypt.compare(
//       password,
//       user.password
//     );

//     if (!isPasswordValid) {
//       return res.status(401).json({
//         message: "Invalid email or password"
//       });
//     }

//     const token = jwt.sign(
//       { userId: user._id.toString() },
//       process.env.JWT_SECRET,
//       { expiresIn: "1h" }
//     );

//     return res.status(200).json({
//       message: "Login successful",
//       token
//     });
//   } catch (error) {
//     console.error("Login error:", error.message);

//     return res.status(500).json({
//       message: "Internal server error"
//     });
//   }
// });

// module.exports = router;
