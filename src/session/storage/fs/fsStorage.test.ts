import { Done, NI_Next } from "fmagic";
import { saveData_, getRecordByUid_, getSessionData_ } from ".";

const readFile = jest.fn();
const writeFile = jest.fn();
const existsSync = jest.fn();

const logger = {
  log: jest.fn(),
};

/* const getSessionData = getSessionData_(readFile, existsSync);

const saveUser = saveUser_(writeFile, getSessionData)(logger as any);

const getUserByUid = getUserByUid_(getSessionData)(logger as any); */

let props = {
  pathToSessionFile: "/path.jpeg",
  uid: "uid",
  dataToSave: { isEditor: true },
};

const sessionData = {
  werweru3234: { isEditor: true },
  sdfsfd: { isEditor: false },
};

type SessionData = {
  [uid: string]: SessionUser;
};

type SessionUser = {
  isEditor: boolean;
};

describe("Session storage service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSessionData_", () => {
    const getSessionData = getSessionData_(readFile, existsSync);

    test("If session file not exists we return - null", async () => {
      existsSync.mockReturnValueOnce(false);

      const res = await getSessionData<SessionData>({
        pathToSessionFile: props.pathToSessionFile,
      });

      expect(readFile).toHaveBeenCalledTimes(0);

      expect(existsSync).toHaveBeenCalledTimes(1);

      expect(res._value).toEqual(null);
    });

    test("On error we return Done with error", async () => {
      existsSync.mockReturnValueOnce(true);
      readFile.mockRejectedValueOnce("Bad error...");

      const res = await getSessionData<SessionData>({
        pathToSessionFile: props.pathToSessionFile,
      });

      expect(readFile).toHaveBeenCalledTimes(1);

      expect(existsSync).toHaveBeenCalledTimes(1);

      expect(res._value).toEqual("Bad error...");
    });

    test("If session exists we get and parse data from it", async () => {
      existsSync.mockReturnValueOnce(true);

      readFile.mockResolvedValueOnce(JSON.stringify(sessionData));

      const res = await getSessionData<SessionData>({
        pathToSessionFile: props.pathToSessionFile,
      });

      expect(readFile).toHaveBeenCalledTimes(1);

      expect(existsSync).toHaveBeenCalledTimes(1);

      expect(res._value).toEqual(sessionData);
    });
  });

  describe("getRecordByUid_", () => {
    const getSessionDataMock = jest.fn();

    const getRecordByUid = getRecordByUid_(getSessionDataMock)(logger as any);

    test("We call getSessionData and on success result by uid - user or null", async () => {
      getSessionDataMock.mockResolvedValueOnce(NI_Next.of(sessionData));

      let res = await getRecordByUid<SessionUser>({
        pathToSessionFile: props.pathToSessionFile,
        uid: props.uid,
      });

      expect(getSessionDataMock).toHaveBeenCalledTimes(1);

      expect(logger.log).toHaveBeenCalledTimes(0);

      expect(res).toEqual(null);

      getSessionDataMock.mockResolvedValueOnce(NI_Next.of(sessionData));

      res = await getRecordByUid<SessionUser>({
        pathToSessionFile: props.pathToSessionFile,
        uid: "sdfsfd",
      });

      expect(res).toEqual({ isEditor: false });
    });

    test("If getSessionData return Done with error - we log it and return null", async () => {
      getSessionDataMock.mockResolvedValueOnce(Done.of("Some error"));

      let res = await getRecordByUid<SessionUser>({
        pathToSessionFile: props.pathToSessionFile,
        uid: props.uid,
      });

      expect(logger.log).toHaveBeenCalledTimes(1);

      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        "error",
        "GET SESSION USER DATA",
        { data: "Some error" }
      );

      expect(res).toEqual(null);
    });
  });

  describe("saveData", () => {
    const getSessionDataMock = jest.fn();

    const saveData = saveData_(writeFile, getSessionDataMock)(logger as any);

    test("We call getSessionData and on success result we add our user info, save to file and log", async () => {
      getSessionDataMock.mockResolvedValueOnce(NI_Next.of(sessionData));
      writeFile.mockResolvedValueOnce(null);

      await saveData<SessionUser>({
        ...props,
      });

      expect(getSessionDataMock).toHaveBeenCalledTimes(1);

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenNthCalledWith(
        1,
        "/path.jpeg",
        '{"werweru3234":{"isEditor":true},"sdfsfd":{"isEditor":false},"uid":{"isEditor":true}}',
        { encoding: "utf-8" }
      );

      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        "info",
        "SAVE USER TO SESSION",
        {
          data: {
            dataToSave: { isEditor: true },
            pathToSessionFile: "/path.jpeg",
            sessionData: {
              sdfsfd: { isEditor: false },
              uid: { isEditor: true },
              werweru3234: { isEditor: true },
            },
            uid: "uid",
          },
        }
      );
    });

    test("We call getSessionData and get empty result - we save our user and log", async () => {
      getSessionDataMock.mockResolvedValueOnce(NI_Next.of(null));
      writeFile.mockResolvedValueOnce(null);

      await saveData<SessionUser>({
        ...props,
      });

      expect(getSessionDataMock).toHaveBeenCalledTimes(1);

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenNthCalledWith(
        1,
        "/path.jpeg",
        '{"uid":{"isEditor":true}}',
        { encoding: "utf-8" }
      );

      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        "info",
        "SAVE USER TO SESSION",
        {
          data: {
            dataToSave: { isEditor: true },
            pathToSessionFile: "/path.jpeg",
            sessionData: { uid: { isEditor: true } },
            uid: "uid",
          },
        }
      );
    });

    test("If we get error some where we log it", async () => {
      getSessionDataMock.mockResolvedValueOnce(NI_Next.of(null));
      writeFile.mockRejectedValueOnce("Bas errror>>>");

      await saveData<SessionUser>({
        ...props,
      });

      expect(getSessionDataMock).toHaveBeenCalledTimes(1);

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(writeFile).toHaveBeenNthCalledWith(
        1,
        "/path.jpeg",
        '{"uid":{"isEditor":true}}',
        { encoding: "utf-8" }
      );

      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenNthCalledWith(
        1,
        "error",
        "SAVE USER TO SESSION",
        { error: "Bas errror>>>" }
      );
    });
  });
});
