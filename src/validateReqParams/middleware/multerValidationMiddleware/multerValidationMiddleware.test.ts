import { uploadCallback } from ".";

const req = {
  body: {
    name: "Vasya",
  },
  file: "file",
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
const reqBodyValidate = jest.fn(() => true);

describe("uploadCallback", () => {
  const callback = uploadCallback(
    req as any,
    res as any,
    next as any,
    logger as any,
    true,
    reqBodyValidate
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("If all okey", () => {
    callback();

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenNthCalledWith(
      1,
      "info",
      "MULTER VALIDATION SUCCESS",
      { body: { name: "Vasya" }, file: "file" }
    );
  });

  test("If got error", () => {
    callback({
      msg: "Error msg",
    });

    expect(next).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenNthCalledWith(
      1,
      "error",
      "-NOT MULTER ERROR",
      { error: { msg: "Error msg" } }
    );
  });
});
