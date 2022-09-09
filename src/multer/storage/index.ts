import { StorageEngine } from "multer";
import multer from "multer";
import { StorageType } from "../types";
import { cond } from "fmagic";
import { join } from "path";

export type MakeStorageProps = {
  type: StorageType;
  pathToUploadDir?: string;
  // For
  upload?: ({ readStream }: { readStream: any }) => Promise<any>;
};

export { default as AWithMaxFileSizeStorage } from "./AWithMaxFileSizeStorage";

export const makeStorage = cond<StorageType, StorageEngine>([
  [
    (type: StorageType) => type === "DISK",
    () =>
      multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, join(process.cwd(), "upload"));
        },
        filename: function (req, file, cb) {
          const fileExtension = file.mimetype.split("/")[1];
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}.${fileExtension}`;
          cb(null, `upload-${uniqueSuffix}`);
        },
      }),
  ],
  [
    (type: StorageType) => type === "GOOGLE_DRIVE",
    () => {
      throw new Error(`No implementation for storage type | GOOGLE_DRIVE |`);
    },
  ],
  [
    (type: StorageType) => type === "YOUTUBE",
    () => {
      throw new Error(`No implementation for storage type | YOUTUBE |`);
    },
  ],
  [
    (type: StorageType) => true,
    (type: StorageType) => {
      throw new Error(`No implementation for storage type | ${type} |`);
    },
  ],
]);
