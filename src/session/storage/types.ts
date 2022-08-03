import { Done, NI_Next } from "fmagic";

export type SessionStorage = {
  getRecordByUid: (
    logger: any
  ) => <T>(props: {
    uid: string;
    pathToSessionFile: string;
  }) => Promise<T | null>;
  save: (
    logger: any
  ) => <T>(props: {
    uid: string;
    dataToSave: T;
    pathToSessionFile: string;
  }) => Promise<void>;
};
