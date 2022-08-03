import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";
import { compose, elif } from "fmagic";
import { ValidateReqParams, ValidateReqParamsProps } from "../../types";

export type ValidationMiddlewareData = {
  reqData: ValidateReqParamsProps;
  validationResult: boolean | string;
};

const validationMiddleware =
  (logger: Logger, reqBodyValidate: ValidateReqParams) =>
  (req: Request, res: Response, next: NextFunction) =>
    compose(
      () => ({
        reqData: {
          reqBody: req.body,
          reqParams: req.params,
          reqQuery: req.query,
        },
      }),
      (data: ValidationMiddlewareData) => ({
        ...data,
        validationResult: reqBodyValidate(data.reqData),
      }),
      elif(
        ({ validationResult }: ValidationMiddlewareData) =>
          validationResult === true,
        (data: ValidationMiddlewareData) => {
          logger.log("info", "REQ PARAMS VALIDATION SUCCESS", {
            reqData: data.reqData,
          });

          next();
        },
        (data: ValidationMiddlewareData) => {
          logger.log("error", "REQ PARAMS VALIDATION ERROR", {
            reqData: data.reqData,
            error: data.validationResult,
          });

          res.status(400).end();
        }
      )
    )();

export default validationMiddleware;
