import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        ".jpg", ".jpeg", ".png",
        ".gif", ".pdf", ".txt",
        ".js", ".py", ".css", ".html"
    ];

    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("This file type is not allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

export default upload;