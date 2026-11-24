import express from "express";

import {
    createNote,
    getProjectNotes,
    updateNote,
    deleteNote
} from "../controllers/noteController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createNote);
router.get("/:projectId", authMiddleware, getProjectNotes);

// Edit a note
router.put("/:noteId", authMiddleware, updateNote);

// Delete a note
router.delete("/:noteId", authMiddleware, deleteNote);

export default router;
