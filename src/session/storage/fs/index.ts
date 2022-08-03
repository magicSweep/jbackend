import {
  chain,
  compose,
  Done,
  elif,
  map,
  NI_Next,
  tap,
  then,
  thenDoneFold,
  _catch,
} from "fmagic";
import { existsSync } from "fs";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import { Logger } from "winston";
import { Path } from "../../../types";
import { SessionStorage } from "../types";

//const pathToSessionFile = join(process.cwd(), "data", "session.json");

// TODO: ADD SAVE USER FOR 1 DAY

type GetSessionDataProps = {
  //uid: string;
  pathToSessionFile: Path;
};

type GetRecordByUidProps = GetSessionDataProps & {
  uid: string;
};

export type SessionData<T> = {
  [uid: string]: T;
};

//type UserData<T> = T & SavedUser;

export const getSessionData_ =
  (
    //pathToSessionFile: Path,
    readFile_: typeof readFile,
    existsSync_: typeof existsSync
  ) =>
  <T>(props: GetSessionDataProps) =>
    elif<GetSessionDataProps, Promise<Done | NI_Next<T | null>>>(
      ({ pathToSessionFile }: GetSessionDataProps) =>
        existsSync_(pathToSessionFile) === true,
      compose(
        async (props: GetSessionDataProps) => ({
          ...props,
          storageData: await readFile_(props.pathToSessionFile, {
            encoding: "utf-8",
          }),
        }),
        then((data: any) => NI_Next.of(JSON.parse(data.storageData))),
        _catch((err: any) => Done.of(err))
      ),
      () => Promise.resolve(NI_Next.of(null))
    )(props);

export const getSessionData = getSessionData_(readFile, existsSync);

export const getRecordByUid_ =
  (
    //pathToSessionFile: Path,
    getSessionData_: typeof getSessionData
  ) =>
  (logger: Logger) =>
  <T>(props: GetRecordByUidProps) =>
    compose<GetRecordByUidProps, Promise<T | null>>(
      (props: GetRecordByUidProps) =>
        compose(
          () => getSessionData_<T>(props),
          then(
            map((sessionData: SessionData<T> | null) => ({
              sessionData,
              ...props,
            }))
          )
        )(),
      /*  then(
        tap((value: any) => {
          console.log("STAGE", value);
        })
      ), */
      thenDoneFold(
        // on error
        (data: any) => {
          logger.log("error", `GET SESSION USER DATA`, {
            data,
          });

          return null;
        },
        // on success
        (
          data: GetRecordByUidProps & { sessionData: SessionData<T> | null }
        ) => {
          /* logger.log("info", `CHECK ROLE`, {
                data,
              }); */

          //console.log("SUCCESS", data);

          const result =
            data.sessionData !== null ? data.sessionData[data.uid] : null;

          return result === undefined ? null : result;
        }
      )
    )(props);

export const getRecordByUid = getRecordByUid_(getSessionData);

type SaveDataProps<T> = GetRecordByUidProps & {
  dataToSave: T;
};

export const saveData_ =
  (writeFile_: typeof writeFile, getSessionData_: typeof getSessionData) =>
  (logger: Logger) =>
  <T>(props: SaveDataProps<T>) =>
    compose<SaveDataProps<T>, Promise<void>>(
      (props: SaveDataProps<T>) =>
        compose(
          () => getSessionData_(props),
          then(
            map((sessionData: SessionData<T> | null) => ({
              sessionData,
              ...props,
            }))
          )
        )(),
      /* then(
        tap((value: any) => {
          console.log("STAGE", value);
        })
      ), */
      // add our role
      then(
        map((data: SaveDataProps<T> & { sessionData: SessionData<T> | null }) =>
          data.sessionData !== null
            ? {
                ...data,
                sessionData: {
                  ...data.sessionData,
                  [data.uid]: data.dataToSave,
                },
              }
            : {
                ...data,
                sessionData: {
                  [data.uid]: data.dataToSave,
                },
              }
        )
      ),
      /* then(
        tap((value: any) => {
          console.log("STAGE-2", value);
        })
      ), */
      // save to file as json
      then(
        chain(
          compose(
            async (
              data: SaveDataProps<T> & { sessionData: SessionData<T> }
            ) => {
              await writeFile_(
                data.pathToSessionFile,
                JSON.stringify(data.sessionData),
                {
                  encoding: "utf-8",
                }
              );
              return data;
            },
            then(NI_Next.of),
            _catch((err: any) => Done.of(err))
          )
        )
      ),

      thenDoneFold(
        // on error
        (err: any) => {
          logger.log("error", `SAVE USER TO SESSION`, {
            error: err,
          });
        },
        // on success
        (data: SaveDataProps<T> & { sessionData: SessionData<T> }) => {
          logger.log("info", `SAVE USER TO SESSION`, {
            data,
          });
        }
      )
    )(props);

export const save = saveData_(writeFile, getSessionData);

/* compose<SaveUserProps, Promise<void>>(
  // get saved roles from file
  getUserByUid_,
  // add our role
  then(
    map(
      (data: UserData<CheckRoleProps & SavedUser & { storageData: any }>) => ({
        ...data,
        storageData: {
          ...data.storageData,
          [data.uid]: data.isEditor,
        },
      })
    )
  ),
  // save to file as json
  then(
    chain(
      compose(
        async (data: UserData<SaveRoleProps>) => {
          await writeFile_(
            pathToSessionFile,
            JSON.stringify(data.storageData),
            {
              encoding: "utf-8",
            }
          );
          return data;
        },
        then(NI_Next.of),
        _catch((err: any) => Done.of(err))
      )
    )
  ),
  thenDoneFold(
    // on error
    (err: any) => {
      logger.log("error", `SAVE ROLE TO SESSION`, {
        error: err,
      });
    },
    // on success
    (data: RoleData<SaveRoleProps>) => {
      logger.log("info", `SAVE ROLE TO SESSION`, {
        data,
      });
    }
  )
);

type CheckRoleProps = {
  uid: string;
};

// check if user role exists
export const checkRole_ =
  (getUserByUid_: typeof getUserByUid) => (logger: Logger) =>
    compose<CheckRoleProps, Promise<boolean | null>>(
      // get info from file
      getUserByUid_,
      // does we have saved user role
      thenDoneFold(
        // on error
        (err: any) => {
          logger.log("error", `CHECK ROLE`, {
            error: err,
          });

          return null;
        },
        // on success
        (data: UserData<CheckRoleProps & SavedUser & { storageData: any }>) => {
          logger.log("info", `CHECK ROLE`, {
            data,
          });

          //const isEditorRes = data.storageData[data.uid];

          // return isEditorRes === undefined ? null : isEditorRes;
          return data.isEidtor;
        }
      )
    );

export const saveRole = saveRole_(sessionFile, writeFile, getInfoFromFile);

export const getRole = checkRole_(getInfoFromFile);
 */
