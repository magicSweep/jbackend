import wait from "waait";
import { createLogger, transports, format } from "winston";

/* 
  LOG LEVELS

  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6

*/

const { combine, timestamp, label, prettyPrint, splat, simple } = format;

const logger = createLogger({
  format: combine(
    /* label({ label: "right meow!" }), */
    timestamp(),
    //simple()
    prettyPrint()
  ),
  transports: [
    /*  new transports.File({
        filename: 'error.log',
        level: 'error',
        format: format.json()
      }),
      new transports.Http({
        level: 'warn',
        format: format.json()
      }), */
    new transports.Console(),
  ],
  //exceptionHandlers: [new transports.Console()],
});

//logger.log

/* 
  
logger.log({
  level: 'info',
  message: 'Hello distributed log files!'
});

logger.info('Hello again distributed logs');

*/

describe("Test logging", () => {
  test("", () => {
    /* logger.log({
      level: "info",
      message: "Hello distributed log files!",
    }); */

    logger.log("info", "Request log.", {
      Request_body: {
        hello: "true",
        h: { qwe: 12, g: { ert: 234, gh: { er: 21 } } },
      },
      bye: 2334,
    });

    expect(true).toEqual(true);
  });
});

describe.skip("Profile", () => {
  test("", async () => {
    logger.profile("test");

    const f = async () => {
      await wait(200);

      return 23;
    };

    let res = await f();

    logger.profile("test");

    await wait(200);

    logger.profile("test");

    expect(res).toEqual(23);
  });
});
