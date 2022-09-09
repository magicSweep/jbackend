//import { unlink } from "fs/promises";
import { Request } from "express";
import { checkMaxFileSizeOnStream } from "./utils";
//import { maxPhotoFileSize } from "lizzygram-common-data/config";

abstract class AWithMaxFileSizeStorage {
  maxFileSizeBytes;

  constructor(maxFileSizeBytes: number = 50000000) {
    this.maxFileSizeBytes = maxFileSizeBytes;
  }

  _handleFile(
    req: Request & { googleDriveId: string },
    file: Express.Multer.File,
    cb: any
  ) {
    /* if (err) return cb(err);

    var googleStream = createWriteStream(path);

    file.stream.pipe(googleStream);
    googleStream.on("error", cb);
    googleStream.on("finish", function () {
      cb(null, {
        path: path,
        size: googleStream.bytesWritten,
      });
    }); */

    console.log("--------------------FILE HANDLER", req.body);

    checkMaxFileSizeOnStream({
      readStream: file.stream,
      maxFileSizeBytes: this.maxFileSizeBytes,
    });
  }

  abstract _removeFile(
    req: Request,
    file: Express.Multer.File,
    cb: any
  ): Promise<void>;
}

export default AWithMaxFileSizeStorage;
