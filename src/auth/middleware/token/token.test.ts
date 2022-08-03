import { tokenMiddleware as tokenMiddleware_ } from ".";

const get = jest.fn(() => "boom super-token");
const query = { token: "gloom puper-token" };

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
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Header type", () => {
    const req = {
      get,
    };

    let tokenMiddleware = tokenMiddleware_("header", logger as any);

    test("If all okey we add token to req object", () => {
      tokenMiddleware(req as any, res as any, next as any);

      expect(next).toHaveBeenCalledTimes(1);

      expect(end).toHaveBeenCalledTimes(0);

      expect(logger.log).toHaveBeenCalledTimes(0);

      expect((req as any).token).toEqual("super-token");
    });

    test("Auth header wrong", () => {
      get.mockReturnValueOnce("boomtoken");

      tokenMiddleware(req as any, res as any, next as any);

      expect(logger.log).toHaveBeenCalledTimes(1);

      expect(logger.log).toHaveBeenNthCalledWith(1, "info", "NO OR BAD TOKEN", {
        AUTHORIZATION_HEADER: "boom super-token",
        DATA: {
          error: "No token in request...",
          header: "boomtoken",
          token: undefined,
        },
        PATH: undefined,
        REQUEST_QUERY: undefined,
      });
    });
  });

  describe("Query type", () => {
    const req = {
      query,
    };

    let tokenMiddleware = tokenMiddleware_("query", logger as any);

    test("If all okey we add token to req object", () => {
      tokenMiddleware(req as any, res as any, next as any);

      expect(next).toHaveBeenCalledTimes(1);

      expect(end).toHaveBeenCalledTimes(0);

      expect(logger.log).toHaveBeenCalledTimes(0);

      expect((req as any).token).toEqual("gloom puper-token");
    });
  });
});
