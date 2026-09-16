import multer from "multer";
import path from "path";
import fs from "fs";

// 1. Create the uploads/menu folder if it doesn't exist
const uploadDir = "uploads/menu";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure the saving rules
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Creates a unique name so two 'burger.jpg' files don't overwrite each other
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });
