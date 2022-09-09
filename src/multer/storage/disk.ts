import { DiskStorageOptions } from "multer";
import { join } from "path";
//import { pathToUploadFilesDir } from "../../../config";

export const photosStorage: DiskStorageOptions = {
  destination: function (req, file, cb) {
    cb(null, join(process.cwd(), "upload"));
  },
  filename: function (req, file, cb) {
    const fileExtension = file.mimetype.split("/")[1];
    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}.${fileExtension}`;
    cb(null, `photo-${uniqueSuffix}`);
  },
};
