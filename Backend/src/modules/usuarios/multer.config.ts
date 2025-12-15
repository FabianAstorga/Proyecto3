import { diskStorage } from "multer";
import { extname } from "path";

export const userMulterConfig = {
  storage: diskStorage({
    destination: "./uploads/users",
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      cb(new Error("Solo se permiten imágenes"), false);
    }
    cb(null, true);
  },
};
