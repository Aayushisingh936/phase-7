import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        originalName: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: true
        },
        fileType: {
            type: String
        },
        fileSize: {
            type: Number
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

const File = mongoose.model("File", fileSchema);

export default File;
