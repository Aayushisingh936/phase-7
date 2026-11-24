import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

router.post("/generate", async (req, res) => {
    try {
        const {
            projectName,
            description,
            features,
            technologies
        } = req.body;

        if (!projectName || !description || !features) {
            return res.status(400).json({
                error: "Project name, description and feature are required."
            });
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });
        const prompt = `
 You are a professional technical documentation writer.
 
 Create a complete, well-structured README.md file for the
 following software pproject.
 
 Project Name: ${projectName}
 
 Description: ${description}
 
 Key Features: ${features}
 
 Technologies Used: ${technologies || "Not specified"}
 
 Include these sections:
 1. Priject Title
 2. Project Description
 3. Features
 4. Technologies Used
 5. Installation and Setup
 6. Usage
 7. Project Structure
 8. Future Improvements
 9. Contributing
 10.License
 
 Important instructions:
- Write in professional and beginner-friendly language.
- Use proper Markdown formatting.
- Include useful code blocks where appropriate.
- Do not invent features that were not provided.
- Use placeholders for unknown setup details.
- Return only the README Markdown content.
`;

     const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt
     });

     const readmeContent = response.text;

     if (!readmeContent) {
        return res.status(502).json({
            error: "Gemini returned an empty response. Please try again."
        })
     }

     res.status(200).json({
        success: true,
        readme: readmeContent
     });
     
    } catch (error) {
        console.error("Gemini API Error:", error);

        res.status(500).json({
            error: "Failed to generate README. please try again."
        });
    }
});

export default router;
