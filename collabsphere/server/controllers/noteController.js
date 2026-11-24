
import Note from "../models/Note.js";
import Project from "../models/Project.js";

export const createNote = async (req, res) => {
    try {
        const { title, content, projectId } = req.body;

        if (!title || !projectId) {
            return res.status(400).json({
                message: "Title and project ID are required"
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

        const note = await Note.create({
            title,
            content,
            project: projectId,
            author: req.user.id
        });

        res.status(201).json({
            message: "Note created successfully",
            note
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const getProjectNotes = async (req, res) => {
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

        const notes = await Note.find({
            project: projectId
        }).populate("author", "name email");

        res.status(200).json({
            notes
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};


// EDIT NOTE
export const updateNote = async (req, res) => {
    try {
        const { title, content } = req.body;

        const note = await Note.findById(req.params.noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        const project = await Project.findById(note.project);

        if (!project || !project.members.some(
            member => member.toString() === req.user.id
        )) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;

        await note.save();

        res.status(200).json({
            message: "Note updated successfully",
            note
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        const project = await Project.findById(note.project);

        if (!project || !project.members.some(
            member => member.toString() === req.user.id
        )) {
            return res.status(403).json({
                message: "You are not a project member"
            });
        }

        await Note.findByIdAndDelete(req.params.noteId);

        res.status(200).json({
            message: "Note deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
