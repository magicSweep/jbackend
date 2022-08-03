import { Request, Response, NextFunction } from "express";
import { chain, compose, cond, Done, fold, NI_Next, _catch } from "fmagic";
import { Logger } from "winston";

/* 
eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ2NDExN2FjMzk2YmM3MWM4YzU5ZmI1MTlmMDEzZTJiNWJiNmM2ZTEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTWlyYWNsZSBNYW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUFUWEFKeGt1bkpxaVZQa0UybDUwSERGWG04YUxQYlVMOVA0dGdwQlZ5OS09czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYW1hemluZy1odWItMzM4MzEzIiwiYXVkIjoiYW1hemluZy1odWItMzM4MzEzIiwiYXV0aF90aW1lIjoxNjQzMzc5NTM2LCJ1c2VyX2lkIjoia013aWJRRXJPNmRESDZnZjNlbnRSTHFGQm9wMiIsInN1YiI6ImtNd2liUUVyTzZkREg2Z2YzZW50UkxxRkJvcDIiLCJpYXQiOjE2NDg4Mzg1NDIsImV4cCI6MTY0ODg0MjE0MiwiZW1haWwiOiJkZXZpbDFtYXkyY2FyZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjEwNTgxODI5OTUwODU4NjU5NDA1OSJdLCJlbWFpbCI6WyJkZXZpbDFtYXkyY2FyZUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.bY9TzoKNdGltgYiLNy6gXYNGNRyQNs-IgROto4MCKHHPV9onYqhHq3xEOLbpfP0Qgme_-k9wIDEmLWvuZ5K8eGtsmjDY-w5QE2KXNafD6sJJYYr8IL8mGL9dE7yNPuoO8w_MXSWeNVdfYBzrDhyIckBxzFcceWQ86QSJulQiYxTtb_WrpPNAbRYzH5wrGftSaRwNf7vj5ruLsRM6waOOY8xw-CyLA5yZXEEV1HcFlXXvaj5ynH-RXEf9WrkMswHIe4wrc8bB2pescs1BbT3ItVLDKKWYB9JEOnMiX-uAiNH2L-WvxkEpDdkNdTOl2vGG7VMhEgU2rYCb8pJi1lSyGg
*/

// header - Authorization: "Boom 234ljwlr324"
// query - ?token=3l234ljlj234
type TokenType = "header" | "query";

type TokenData = {
  header: string | undefined;
  query: any;
  token: string | undefined;
  error: any;
};

export const tokenMiddleware =
  (tokenType: TokenType, logger: Logger) =>
  async (req: Request, res: Response, next: NextFunction) =>
    compose(
      cond([
        [
          () => tokenType === "header",
          compose(
            () => ({ header: req.get("Authorization") }),
            (data: TokenData) =>
              data.header === undefined
                ? Done.of({
                    ...data,
                    error: "No authorization header",
                  })
                : NI_Next.of({
                    ...data,
                    token: data.header.split(" ")[1],
                  })
          ),
        ],
        [
          () => tokenType === "query",
          () =>
            NI_Next.of({
              query: req.query,
              token: req.query.token,
            }),
        ],
        [
          () => true,
          () =>
            Done.of({
              error: `Unknown token type ${tokenType}`,
            }),
        ],
      ]),

      chain((data: TokenData) =>
        typeof data.token !== "string"
          ? Done.of({
              ...data,
              error: "No token in request...",
            })
          : NI_Next.of(data)
      ),

      fold(
        (data: TokenData) => {
          logger.log("info", "NO OR BAD TOKEN", {
            PATH: req.path,
            REQUEST_QUERY: req.query,
            AUTHORIZATION_HEADER: req.get("Authorization"),
            DATA: data,
          });

          res.status(401).end();
        },
        (data: TokenData) => {
          (req as any).token = data.token;

          next();
        }
      )

      /*  () => ({
        header: req.get("Authorization"),
      }),
      (data: AuthData) =>
        data.header === undefined
          ? Done.of("No authorization header")
          : NI_Next.of(data),
      map((data: AuthData) => ({
        ...data,
        token: req.get("Authorization")?.split(" ")[1],
      })),
      chain(
        compose(
          async (data: AuthData) => ({
            ...data,
            user: await getAuthUser(data.token as string),
          }),
          then(NI_Next.of),
          _catch((err: any) => Done.of(err))
        )
      ),
      thenDoneFold(
        (err: any) => {
          logger.log("info", "UNAUTHORIZE", {
            METHOD: req.method,
            PATH: req.path,
            REQUEST_BODY: req.body,
            REQUEST_QUERY: req.query,
            AUTHORIZATION_HEADER: req.get("Authorization"),
            ERROR: err,
          });

          res.status(401).end();
        },
        (data: AuthData) => {
          logger.log("info", "AUTHORIZE", {
            USER: data.user,
            //DECODE_TOKEN: decodedToken,
          });

          (req as any).user = data.user;

          return next();
        }
      ) */
    )();
