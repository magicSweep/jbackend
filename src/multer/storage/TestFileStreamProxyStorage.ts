import { createWriteStream, createReadStream, read } from "fs";
//import { unlink } from "fs/promises";
import { Request } from "express";
import { join } from "path";
import AWithMaxFileSizeStorage from "./AWithMaxFileSizeStorage";
//import { maxPhotoFileSize } from "lizzygram-common-data/config";

const uploadImage_ = ({ readStream }: any) => {
  return new Promise<{ id: string }>((resolve, reject) => {
    const googleStream = createWriteStream(
      join(
        process.cwd(),
        "upload",
        `${Math.round(Math.random() * 10000)}-photo.jpeg`
      )
    );

    readStream.pipe(googleStream);

    googleStream.on("finish", function () {
      console.log("FINISH", googleStream.bytesWritten);
      resolve({
        id: "google-drive-123",
      });
    });
  });
};

export class TestFileStreamProxyStorage extends AWithMaxFileSizeStorage {
  /* getDestination(req, file, cb) {
    cb(null, "/dev/null");
  } */

  constructor(maxFileSizeBytes: number = 50000000) {
    super(maxFileSizeBytes);
  }

  // WE UPLOAD FILE AND CHECK MAX FILE SIZE
  // ON SUCCESS WE POPULATE req.file WITH googleDriveId
  async _handleFile(
    req: Request & { googleDriveId: string },
    file: Express.Multer.File,
    cb: any
  ) {
    super._handleFile(req, file, cb);

    try {
      /* const res = await withMaxFileSizeUpload({
        readStream: file.stream,
        uploadStream: uploadImage_,
        maxFileSizeBytes: this.maxFileSizeBytes,
      }); */

      const res = await uploadImage_({
        readStream: file.stream,
      });

      req.googleDriveId = res.id;

      console.log("--------------------FILE HANDLER", req.googleDriveId);

      cb(null, res);
    } catch (error: any) {
      console.log("--------------------FILE HANDLER ERROR", error);
      cb(error);
    }
  }

  async _removeFile(req: Request, file: Express.Multer.File, cb: any) {
    try {
      //unlink(file.path);
      cb();
    } catch (error) {
      cb(error);
    }
  }
}

//export default new GoogleDriveStorage();
