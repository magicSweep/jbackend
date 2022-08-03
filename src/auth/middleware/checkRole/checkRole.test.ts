import {
  checkRoleMiddleware as checkRoleMiddleware_,
  CheckRoleConfig,
} from ".";

const userExists = jest.fn(() => Promise.resolve(true));

const req = {
  user: {
    uid: "helloUid",
  },
};

const end = jest.fn();

const res = {
  status: jest.fn(() => ({
    end,
  })),
};
const next = jest.fn();

const logger = {
  log: jest.fn(),
};

/* type SessionStorage = {
  getRole: (props: { uid: string }) => Promise<boolean | null>;
  saveRole: (props: { uid: string; isEditor: boolean }) => Promise<void>;
}; */

const getRecord_ = jest.fn();
const saveRole_ = jest.fn();

const sessionStorage = {
  getRecordByUid: () => getRecord_,
  save: () => saveRole_,
};

describe("checkRoleMiddleware", () => {
  const cnf: CheckRoleConfig = {
    pathToSessionFile: "/path/to/session/file.json",
    sessionStorage,
  };

  const checkRoleMiddleware = checkRoleMiddleware_(
    logger as any,
    userExists,
    cnf
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("First we check if we have saved role for current user. If yes - we only return add it to user.", async () => {
    getRecord_.mockResolvedValueOnce(true);

    let iReq: any = { user: { ...req.user } };

    await checkRoleMiddleware(iReq, res as any, next as any);

    expect(getRecord_).toHaveBeenCalledTimes(1);
    expect(getRecord_).toHaveBeenNthCalledWith(1, {
      pathToSessionFile: "/path/to/session/file.json",
      uid: "helloUid",
    });

    expect(userExists).toHaveBeenCalledTimes(0);

    expect(saveRole_).toHaveBeenCalledTimes(0);

    expect(next).toHaveBeenCalledTimes(1);

    expect(end).toHaveBeenCalledTimes(0);

    expect(logger.log).toHaveBeenNthCalledWith(1, "info", "USER IS EDITOR");
  });

  test("If we do not have saved to session user - we send request to db to get role.", async () => {
    getRecord_.mockResolvedValueOnce(null);

    userExists.mockResolvedValueOnce(true);

    await checkRoleMiddleware(
      { user: { ...req.user } } as any,
      res as any,
      next as any
    );

    expect(getRecord_).toHaveBeenCalledTimes(1);
    expect(getRecord_).toHaveBeenNthCalledWith(1, {
      pathToSessionFile: "/path/to/session/file.json",
      uid: "helloUid",
    });

    expect(userExists).toHaveBeenCalledTimes(1);
    expect(userExists).toHaveBeenNthCalledWith(1, "helloUid");

    expect(next).toHaveBeenCalledTimes(1);

    expect(end).toHaveBeenCalledTimes(0);

    expect(logger.log).toHaveBeenNthCalledWith(1, "info", "USER IS EDITOR");
  });

  test("If user not editor - we return 403 status", async () => {
    getRecord_.mockResolvedValueOnce(null);

    userExists.mockResolvedValueOnce(false);

    await checkRoleMiddleware(
      { user: { ...req.user } } as any,
      res as any,
      next as any
    );

    expect(getRecord_).toHaveBeenCalledTimes(1);
    expect(getRecord_).toHaveBeenNthCalledWith(1, {
      pathToSessionFile: "/path/to/session/file.json",
      uid: "helloUid",
    });

    expect(userExists).toHaveBeenCalledTimes(1);
    expect(userExists).toHaveBeenNthCalledWith(1, "helloUid");

    expect(next).toHaveBeenCalledTimes(0);

    expect(end).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenNthCalledWith(1, 403);

    expect(logger.log).toHaveBeenNthCalledWith(1, "info", "USER NOT EDITOR");
  });

  test("Error on user db request - we return 500 status", async () => {
    getRecord_.mockResolvedValueOnce(null);

    userExists.mockRejectedValueOnce("Bad fat error...");

    await checkRoleMiddleware(
      { user: { ...req.user } } as any,
      res as any,
      next as any
    );

    expect(getRecord_).toHaveBeenCalledTimes(1);
    expect(getRecord_).toHaveBeenNthCalledWith(1, {
      pathToSessionFile: "/path/to/session/file.json",
      uid: "helloUid",
    });

    expect(userExists).toHaveBeenCalledTimes(1);
    expect(userExists).toHaveBeenNthCalledWith(1, "helloUid");

    expect(next).toHaveBeenCalledTimes(0);

    expect(end).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenNthCalledWith(1, 500);

    expect(logger.log).toHaveBeenNthCalledWith(1, "error", "CHECK ROLE ERROR", {
      ERROR: "Bad fat error...",
      METHOD: undefined,
      PATH: undefined,
      USER: { uid: "helloUid" },
    });
  });
});
