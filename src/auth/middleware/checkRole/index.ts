import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";
import { UserDb } from "../../types";
import {
  chain,
  compose,
  Done,
  elif,
  NI_Next,
  then,
  thenDoneFold,
  _catch,
} from "fmagic";
import { AuthUser } from "../../types";
import { SessionStorage } from "../../../session/storage/types";

export type CheckRoleData = {
  user: AuthUser;
  savedUserData: SessionUser | null;
  userData: SessionUser;
};

type SessionUser = {
  isEditor: boolean;
};

const onSuccessReq = (req: any, res: any, next: any, logger: any) =>
  elif<CheckRoleData, void>(
    ({ savedUserData, userData }: CheckRoleData) =>
      savedUserData === null
        ? userData.isEditor === false
        : savedUserData.isEditor === false,
    (data: CheckRoleData) => {
      logger.log("info", "USER NOT EDITOR");

      res.status(403).end();
    },
    (data: CheckRoleData) => {
      logger.log("info", "USER IS EDITOR");

      (req as any).user.isEditor = true;

      next();
    }
  );

export type CheckRoleConfig = {
  pathToSessionFile: string;
  sessionStorage?: SessionStorage;
};

export const checkRoleMiddleware =
  (logger: Logger, userExists: UserDb["exists"], cnf: CheckRoleConfig) =>
  async (req: Request, res: Response, next: NextFunction) =>
    compose(
      () => ({
        user: (req as any).user,
      }),
      async (data: CheckRoleData) => ({
        ...data,
        savedUserData:
          cnf.sessionStorage !== undefined
            ? await cnf.sessionStorage.getRecordByUid(logger)({
                uid: data.user.uid,
                pathToSessionFile: cnf.pathToSessionFile,
              })
            : null,
      }),
      then((data: CheckRoleData) =>
        data.savedUserData === null ? NI_Next.of(data) : Done.of(data)
      ),
      then(
        chain(
          compose(
            async (data: CheckRoleData) => ({
              ...data,
              userData: {
                isEditor: await userExists(data.user.uid),
              },
            }),
            then(NI_Next.of),
            _catch((err: any) => Done.of({ error: err }))
          )
        )
      ),
      thenDoneFold(
        (data: CheckRoleData & { error: any }) => {
          // does not need to save to session storage

          if (data.error !== undefined) {
            logger.log("error", "CHECK ROLE ERROR", {
              METHOD: req.method,
              PATH: req.path,
              USER: (req as any).user,
              ERROR: data.error,
            });

            res.status(500).end();
          } else {
            onSuccessReq(req, res, next, logger)(data);
          }
        },
        (data: CheckRoleData) => {
          // need to save to session storage
          if (cnf.sessionStorage !== undefined) {
            cnf.sessionStorage.save(logger)({
              uid: data.user.uid,
              pathToSessionFile: cnf.pathToSessionFile,
              dataToSave: data.userData,
            });
          }

          onSuccessReq(req, res, next, logger)(data);
        }
      )
    )();

/* export const checkRoleMiddleware =
  (userExists: UserDb["exists"], sessionStorage: SessionStorage) =>
  (logger: Logger) =>
  async (req: Request, res: Response, next: NextFunction) =>
    compose(
      () => ({
        user: (req as any).user,
      }),
      async (data: CheckRoleData) => ({
        ...data,
        exists: await userExists(data.user.uid),
      }),
      then(
        elif(
          ({ exists }: CheckRoleData) => exists === false,
          (data: CheckRoleData) => {
            logger.log("info", "USER NOT EDITOR");

            res.status(403).end();
          },
          (data: CheckRoleData) => {
            logger.log("info", "USER IS EDITOR");

            (req as any).user.isEditor = true;

            next();
          }
        )
      ),
      _catch((err: any) => {
        logger.log("error", "CHECK ROLE ERROR", {
          METHOD: req.method,
          PATH: req.path,
          USER: (req as any).user,
          ERROR: err,
        });

        res.status(500).end();
      })
    )(); */
