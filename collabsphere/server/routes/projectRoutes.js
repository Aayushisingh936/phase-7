import express from "express";

import {
    createProject,
    getMyProjects,
    addProjectMember,
    enableProjectSharing,
    disableProjectSharing,
    getPublicProject
} from "../controllers/projectController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - no login required
router.get("/public/:shareToken", getPublicProject);

// Protected project routes
router.post("/", authMiddleware, createProject);
router.get("/my-projects", authMiddleware, getMyProjects);
router.post("/:projectId/members", authMiddleware, addProjectMember);

// Sharing controls
router.post("/:projectId/share", authMiddleware, enableProjectSharing);
router.delete("/:projectId/share", authMiddleware, disableProjectSharing);

export default router;
