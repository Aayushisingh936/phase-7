
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { readFile } from "fs/promises";

import Note from "../models/Note.js";
import File from "../models/File.js";
import Project from "../models/Project.js";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// CHECK PROJECT MEMBERSHIP
const checkProjectMembership = async (projectId, userId) => {
    const project = await Project.findById(projectId);

    if (!project) return null;

    const isMember = project.members.some(
        member => member.toString() === userId.toString()
    );

    return isMember ? project : false;
};

// EXPLAIN NOTE
export const explainNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        const project = await checkProjectMembership(
            note.project,
            req.user.id
        );

        if (project === null) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        const prompt = `Explain this project note in simple language:\n\n${note.content}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.json({
            result: response.text
        });

    } catch (error) {
        console.error("Gemini Error:", error.message);

        res.status(500).json({
            message: "Failed to explain note"
        });
    }
};

// IMPROVE NOTE
export const improveNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        const note = await Note.findById(noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        const project = await checkProjectMembership(
            note.project,
            req.user.id
        );

        if (project === null) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        const prompt = `Suggest improvements for this project note. Keep the meaning but improve clarity and structure:\n\n${note.content}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.json({
            result: response.text
        });

    } catch (error) {
        console.error("Gemini Error:", error.message);

        res.status(500).json({
            message: "Failed to improve note"
        });
    }
};

// EXPLAIN UPLOADED CODE
export const explainCode = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findById(fileId);

        if (!file) {
            return res.status(404).json({
                message: "File not found"
            });
        }

        const project = await checkProjectMembership(
            file.project,
            req.user.id
        );

        if (project === null) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        const extension = file.originalName
            .split(".")
            .pop()
            .toLowerCase();

        if (!["js", "py"].includes(extension)) {
            return res.status(400).json({
                message: "Only JavaScript and Python files are supported"
            });
        }

        if (file.fileSize > 30000) {
            return res.status(400).json({
                message: "File is too large to explain"
            });
        }

        const code = await readFile(file.filePath, "utf8");

        const prompt = `
Explain this ${extension === "js" ? "JavaScript" : "Python"} code in simple language.

Include:
1. Purpose of the code
2. Important variables and functions
3. Step-by-step working
4. Programming concepts used

Code:
${code}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.json({
            result: response.text
        });

    } catch (error) {
        console.error("Code explanation error:", error.message);

        res.status(500).json({
            message: "Failed to explain code"
        });
    }
};

// GENERATE PROJECT README
export const generateReadme = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { features, technologies } = req.body;

        const project = await checkProjectMembership(
            projectId,
            req.user.id
        );

        if (project === null) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        const prompt = `
Create a professional and complete README.md file for this project.

Project Name: ${project.name}

Project Description: ${project.description || "No description provided"}

Key Features:
${features || "Suggest suitable features based on the project description."}

Technologies Used:
${technologies || "Suggest suitable technologies based on the project description."}

Include these sections:
1. Project Title
2. Project Description
3. Features
4. Technologies Used
5. Installation Instructions
6. Usage
7. Project Structure (use a simple example)
8. Future Improvements
9. Contributing
10. License

Write the README in clean Markdown.
Do not invent specific configuration values, API keys, or database credentials.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.status(200).json({
            message: "README generated successfully",
            result: response.text
        });

    } catch (error) {
        console.error("README generation error:", error.message);

        res.status(500).json({
            message: "Failed to generate README"
        });
    }
};

 // GENERATE PROJECT DOCUMENTATION
export const generateDocs = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await checkProjectMembership(
            projectId,
            req.user.id
        );

        if (project === null) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (!project) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        const prompt = `
Create detailed technical documentation for this project.

Project Name: ${project.name}
Description: ${project.description || "No description provided"}

Include:
1. Project Overview
2. Main Features
3. Technologies Used (only mention known technologies)
4. Project Architecture
5. Installation Guide
6. How to Use
7. Future Improvements

Write everything in professional Markdown.
Do not invent project-specific implementation details.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        res.status(200).json({
            message: "Documentation generated successfully",
            result: response.text
        });

    } catch (error) {
        console.error("Docs generation error:", error.message);

        res.status(500).json({
            message: "Failed to generate documentation"
        });
    }
};

export const explainContent = async (req, res) => {
  try {
    const { content, type } = req.body;

    if (typeof content !== "string" || !content.trim()) {
      return res.status(400).json({
        message: "Please provide content to explain."
      });
    }

    const contentType = type === "code" ? "code" : "note";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Explain the following ${contentType} in simple language.
        Break down the important points step by step.
        Give examples where useful.

        Content:
        ${content}
      `
    });

    return res.status(200).json({
      message: "Explanation generated successfully",
      result: response.text
    });

  } catch (error) {
    console.error("Explain content error:", error);

    return res.status(500).json({
      message: "Failed to explain content."
    });
  }
};

