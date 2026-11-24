import express from "express";

import {
  explainNote,
  improveNote,
  explainCode,
  generateReadme,
  generateDocs,
  explainContent
} from "../controllers/aiController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/explain/:noteId", authMiddleware, explainNote);
router.post("/improve/:noteId", authMiddleware, improveNote);

router.post("/explain-code/:fileId", authMiddleware, explainCode);

router.post("/explain", authMiddleware, explainContent);

router.post("/docs/:projectId", authMiddleware, generateDocs);

router.post("/readme/:projectId", authMiddleware, generateReadme);

router.post("/generate-readme/:projectId", authMiddleware, generateReadme);

export default router;
