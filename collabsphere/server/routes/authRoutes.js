import express from "express";
import { register, login } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Register
router.post("/register", register);

// Login
router.post("/login", login);

// Get logged-in user's profile
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Access granted! You are logged in.",
        user: req.user
    });
});

export default router;
