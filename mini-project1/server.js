import "dotenv/config";

import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "User Authentication API is running"
  })
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        console.error("MONGO_URI and JWT_SECRET must be configured");
        process.exit(1);
    }

    await connectDB();

    app.listen(PORT, ()=> {
        console.log(`Server running at http://localhost:${PORT}`);
    })
};

startServer ();