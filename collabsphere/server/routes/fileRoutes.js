import express from "express";

import {
    uploadFile,
    getProjectFiles
} from "../controllers/fileController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
    upload.single("file")(req, res, (error) => {
        if (error) {
            const statusCode =
                error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

            return res.status(statusCode).json({
                message: error.message
            });
        }

        next();
    });
};

router.post(
    "/upload",
    authMiddleware,
    handleUpload,
    uploadFile
);

router.get(
    "/:projectId",
    authMiddleware,
    getProjectFiles
);

export default router;