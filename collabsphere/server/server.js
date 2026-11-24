import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notes", noteRoutes);

app.use("/api/ai", aiRoutes);
app.use("/api/gemini", aiRoutes);

app.use("/api/files", fileRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to CollabSphere API!");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`CollabSphere server running on port ${PORT}`);
    });
};

startServer();