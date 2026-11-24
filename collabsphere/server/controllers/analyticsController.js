import Project from "../models/Project.js";
import Note from "../models/Note.js";
import File from "../models/File.js";

export const getAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        const projects = await Project.find({
            $or: [
                { owner: userId },
                { members: userId }
            ]
        })
            .select("name owner members")
            .populate("owner", "name email")
            .populate("members", "name email");

        const projectIds = projects.map(project => project._id);

        const [totalNotes, totalFiles] = await Promise.all([
            Note.countDocuments({
                project: { $in: projectIds }
            }),
            File.countDocuments({
                project: { $in: projectIds }
            })
        ]);

        const teamMembers = new Set();

        const projectContributions = await Promise.all(
            projects.map(async (project) => {
                const [noteCounts, fileCounts] = await Promise.all([
                    Note.aggregate([
                        { $match: { project: project._id } },
                        {
                            $group: {
                                _id: "$author",
                                count: { $sum: 1 }
                            }
                        }
                    ]),
                    File.aggregate([
                        { $match: { project: project._id } },
                        {
                            $group: {
                                _id: "$uploadedBy",
                                count: { $sum: 1 }
                            }
                        }
                    ])
                ]);

                const noteMap = new Map(
                    noteCounts.map(item => [
                        item._id.toString(),
                        item.count
                    ])
                );

                const fileMap = new Map(
                    fileCounts.map(item => [
                        item._id.toString(),
                        item.count
                    ])
                );

                const membersMap = new Map();

                if (project.owner) {
                    membersMap.set(
                        project.owner._id.toString(),
                        project.owner
                    );
                }

                project.members.forEach(member => {
                    if (member) {
                        membersMap.set(
                            member._id.toString(),
                            member
                        );
                    }
                });

                const members = Array.from(membersMap.values()).map(member => {
                    const memberId = member._id.toString();

                    if (memberId !== userId.toString()) {
                        teamMembers.add(memberId);
                    }

                    return {
                        userId: memberId,
                        name: member.name,
                        email: member.email,
                        notesCreated: noteMap.get(memberId) || 0,
                        filesUploaded: fileMap.get(memberId) || 0
                    };
                });

                return {
                    projectId: project._id,
                    projectName: project.name,
                    members
                };
            })
        );

        res.status(200).json({
            totalProjects: projects.length,
            totalTeamMembers: teamMembers.size,
            totalNotes,
            totalFiles,
            projectContributions
        });

    } catch (error) {
        console.error("Analytics Error:", error);

        res.status(500).json({
            message: "Failed to fetch analytics"
        });
    }
};