import express from "express";
import cors from "cors";
import "dotenv/config";
import readmeRouter from "./routes/readme.js";

const app = express();

console.log("README ROUTER IMPORTED:", typeof readmeRouter);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Gemini README Generator API is running!");
});

app.use("/api/readme", readmeRouter);

console.log("README ROUTE MOUNTED");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
