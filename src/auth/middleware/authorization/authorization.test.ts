import { authorization as authorization_ } from ".";

const getAuthUser = jest.fn(() =>
  Promise.resolve({
    uid: "userUid",
  })
);

const req = {
  token: "pop-token",
  get: () => "boom pop-token",
};

const end = jest.fn();

const res = {
  status: () => ({
    end,
  }),
};
const next = jest.fn();

const logger = {
  log: jest.fn(),
};

describe("", () => {
  const authorization = authorization_(logger as any, getAuthUser);

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("If all okey", async () => {
    await authorization(req as any, res as any, next as any);

    expect(getAuthUser).toHaveBeenCalledTimes(1);
    expect(getAuthUser).toHaveBeenNthCalledWith(1, "pop-token");

    expect(next).toHaveBeenCalledTimes(1);

    expect(end).toHaveBeenCalledTimes(0);

    expect(logger.log).toHaveBeenNthCalledWith(1, "info", "AUTHORIZE", {
      USER: { uid: "userUid" },
    });
  });

  test("Error on token verify", async () => {
    getAuthUser.mockRejectedValueOnce("Bad token...");

    await authorization(req as any, res as any, next as any);

    expect(getAuthUser).toHaveBeenCalledTimes(1);
    expect(getAuthUser).toHaveBeenNthCalledWith(1, "pop-token");

    expect(next).toHaveBeenCalledTimes(0);

    expect(end).toHaveBeenCalledTimes(1);

    expect(logger.log).toHaveBeenNthCalledWith(1, "info", "UNAUTHORIZE", {
      AUTHORIZATION_HEADER: "boom pop-token",
      ERROR: "Bad token...",
      METHOD: undefined,
      PATH: undefined,
      REQUEST_BODY: undefined,
      REQUEST_QUERY: undefined,
    });
  });
});
