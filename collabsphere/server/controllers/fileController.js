import File from "../models/File.js";
import Project from "../models/Project.js";

// UPLOAD FILE
export const uploadFile = async (req, res) => {
    try {
        const { projectId } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a file"
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const isMember = project.members.some(
            member => member.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        const file = await File.create({
            originalName: req.file.originalname,
            filename: req.file.filename,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            project: projectId,
            uploadedBy: req.user.id
        });

        res.status(201).json({
            message: "File uploaded successfully",
            file
        });

    } catch (error) {
        console.error("Upload error:", error.message);
        res.status(500).json({
            message: error.message
        });
    }
};

// GET PROJECT FILES
export const getProjectFiles = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const isMember = project.members.some(
            member => member.toString() === req.user.id
        );

        if (!isMember) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        const files = await File.find({
            project: projectId
        }).populate("uploadedBy", "name email");

        res.status(200).json({ files });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
