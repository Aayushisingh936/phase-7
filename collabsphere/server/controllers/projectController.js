import Project from "../models/Project.js";
import User from "../models/User.js";
import { randomBytes } from "crypto";

// CREATE PROJECT
export const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Project name is required"
            });
        }

        const project = await Project.create({
            name,
            description,
            owner: req.user.id,
            members: [req.user.id]
        });

        res.status(201).json({
            message: "Project created successfully",
            project
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET MY PROJECTS
export const getMyProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            members: req.user.id
        }).populate("owner members", "name email");

        res.status(200).json({ projects });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ADD PROJECT MEMBER
export const addProjectMember = async (req, res) => {
    try {
        const { email } = req.body;
        const { projectId } = req.params;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found. Please register first"
            });
        }

        if (project.members.some(
            member => member.toString() === user._id.toString()
        )) {
            return res.status(400).json({
                message: "User is already a project member"
            });
        }

        project.members.push(user._id);
        await project.save();

        res.status(200).json({
            message: "Member added successfully",
            project
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ENABLE PUBLIC PROJECT SHARING
export const enableProjectSharing = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (project.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "Only the project owner can share this project"
            });
        }

        if (!project.shareToken) {
            project.shareToken = randomBytes(24).toString("hex");
        }

        project.isPublic = true;
        await project.save();

        res.status(200).json({
            message: "Public sharing enabled",
            shareUrl: `${req.protocol}://${req.get("host")}/api/projects/public/${project.shareToken}`
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// DISABLE PUBLIC PROJECT SHARING
export const disableProjectSharing = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        if (project.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                message: "Only the project owner can disable sharing"
            });
        }

        project.isPublic = false;
        project.shareToken = undefined;
        await project.save();

        res.status(200).json({
            message: "Public sharing disabled"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// VIEW PUBLIC PROJECT
export const getPublicProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            shareToken: req.params.shareToken,
            isPublic: true
        }).select("name description createdAt");

        if (!project) {
            return res.status(404).json({
                message: "Shared project not found or sharing is disabled"
            });
        }

        res.status(200).json({
            message: "Public project retrieved successfully",
            project
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
