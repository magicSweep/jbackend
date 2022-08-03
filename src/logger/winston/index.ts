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

//logger.log

const { combine, timestamp, prettyPrint } = format;

export const logger = createLogger({
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

/* export const logger = createLogger({
  transports: [
    new transports.File({
      filename: "error.log",
      level: "error",
      format: format.json(),
    }),
    new transports.Http({
      level: "warn",
      format: format.json(),
    }),
    new transports.Console({
      level: "info",
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
}); */
