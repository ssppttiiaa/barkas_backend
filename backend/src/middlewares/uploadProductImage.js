import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const uploadProductImage = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export default uploadProductImage;
