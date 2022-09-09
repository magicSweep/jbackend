import { DiskStorageOptions, Multer, Options, StorageEngine } from "multer";
import {
  ValidateReqParams,
  ValidateReqFile,
} from "../../validateReqParams/types";
import multer from "multer";
import { RequestHandler, Request, Response, NextFunction } from "express";
import { Logger } from "winston";
import { chain, compose, cond, Done, elif, fold, NI_Next } from "fmagic";
import { join } from "path";

type UploadFuncData = {
  error?: any;
  msgLevel: string;
  logMsg: string;
};

export type MulterOptions = {
  multerLimits: Options["limits"];
  validateReqParams?: ValidateReqParams;
  validateReqFile?: ValidateReqFile;
  logger: Logger;
  isFileRequired: boolean;
  //storageType: StorageType;
};

export const multerMiddleware_ =
  (makeFileFilter: any, uploadCallback: any) =>
  (options: MulterOptions, storage?: StorageEngine) =>
  (req: Request, res: Response, next: NextFunction) => {
    const upload = multer({
      storage, //makeStorage(options.storageType)
      limits: options.multerLimits,
      fileFilter: makeFileFilter(
        options.validateReqParams,
        options.validateReqFile
      ),
    }).single("file");

    const uploadCallback_ = uploadCallback(
      options.isFileRequired,
      options.logger
    );

    return upload(req, res, uploadCallback_(req, res, next));
  };

export const makeFileFilter: (
  validateReqParams?: ValidateReqParams,
  validateReqFile?: ValidateReqFile
) => Options["fileFilter"] = (validateReqParams, validateReqFile) => {
  if (validateReqParams === undefined && validateReqFile === undefined)
    return undefined;

  return (req, file, cb) => {
    console.log("--------------------FILE FILTER", file);

    let validRes: string | boolean = true;

    if (validateReqParams !== undefined) {
      validRes = validateReqParams({
        reqBody: req.body,
        reqParams: req.params,
        reqQuery: req.query,
      });

      if (validRes !== true) {
        return cb(new Error(validRes as string));
      }
    }

    if (validateReqFile !== undefined) {
      validRes = validateReqFile(file);

      if (validRes !== true) {
        return cb(new Error(validRes as string));
      }
    }

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted
    // To reject this file pass `false`, like so:
    //cb(null, false);
    // To accept the file pass `true`, like so:
    return cb(null, true);
  };
};

export const uploadCallback =
  (isFileRequired: boolean, logger: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    compose<any, NextFunction>(
      (err: any) => NI_Next.of({ error: err }),
      chain(
        cond([
          [
            ({ error }: UploadFuncData) => error !== undefined,
            elif<UploadFuncData, any>(
              (data: UploadFuncData) =>
                data.error instanceof multer.MulterError,
              (data: UploadFuncData) =>
                Done.of({
                  ...data,
                  msgLevel: "info",
                  logMsg: "MULTER VALIDATION FAILED",
                }),
              (data: UploadFuncData) =>
                Done.of({
                  ...data,
                  msgLevel: "error",
                  logMsg: "-NOT MULTER ERROR",
                })
            ),
          ],
          [
            () => isFileRequired === true && req.file === undefined,
            (data: UploadFuncData) =>
              Done.of({
                ...data,
                msgLevel: "error",
                logMsg: "NO FILE ON REQUEST OBJECT",
              }),
          ],
          /* [
        () =>
          reqBodyValidate !== undefined &&
          reqBodyValidate({
            reqBody: req.body,
            reqParams: req.params,
          }) !== true,
        (data: UploadFuncData) =>
          Done.of({
            ...data,
            // TODO change that bad design
            error: (reqBodyValidate as any)({
              reqBody: req.body,
              reqParams: req.params,
            }),
            msgLevel: "info",
            logMsg: "VALIDATION REQUEST PARAMS FAILED",
          }),
      ], */
          [() => true, NI_Next.of],
        ])
      ),
      fold(
        ({ msgLevel, logMsg, error }: UploadFuncData) => {
          logger.log(msgLevel, logMsg, { error });

          res.status(400).end();
        },
        () => {
          logger.log("info", "MULTER VALIDATION SUCCESS", {
            body: req.body,
            file: req.file,
          });

          next();
        }
      )
    );

export const multerMiddleware = multerMiddleware_(
  makeFileFilter,
  uploadCallback
);
