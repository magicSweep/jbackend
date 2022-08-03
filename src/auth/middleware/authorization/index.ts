import { Request, Response, NextFunction } from "express";
import {
  chain,
  compose,
  Done,
  map,
  NI_Next,
  then,
  thenDoneFold,
  _catch,
} from "fmagic";
import { Logger } from "winston";
import { AuthUser } from "../../types";

/* 
eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ2NDExN2FjMzk2YmM3MWM4YzU5ZmI1MTlmMDEzZTJiNWJiNmM2ZTEiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiTWlyYWNsZSBNYW4iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUFUWEFKeGt1bkpxaVZQa0UybDUwSERGWG04YUxQYlVMOVA0dGdwQlZ5OS09czk2LWMiLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYW1hemluZy1odWItMzM4MzEzIiwiYXVkIjoiYW1hemluZy1odWItMzM4MzEzIiwiYXV0aF90aW1lIjoxNjQzMzc5NTM2LCJ1c2VyX2lkIjoia013aWJRRXJPNmRESDZnZjNlbnRSTHFGQm9wMiIsInN1YiI6ImtNd2liUUVyTzZkREg2Z2YzZW50UkxxRkJvcDIiLCJpYXQiOjE2NDg4Mzg1NDIsImV4cCI6MTY0ODg0MjE0MiwiZW1haWwiOiJkZXZpbDFtYXkyY2FyZUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJnb29nbGUuY29tIjpbIjEwNTgxODI5OTUwODU4NjU5NDA1OSJdLCJlbWFpbCI6WyJkZXZpbDFtYXkyY2FyZUBnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJnb29nbGUuY29tIn19.bY9TzoKNdGltgYiLNy6gXYNGNRyQNs-IgROto4MCKHHPV9onYqhHq3xEOLbpfP0Qgme_-k9wIDEmLWvuZ5K8eGtsmjDY-w5QE2KXNafD6sJJYYr8IL8mGL9dE7yNPuoO8w_MXSWeNVdfYBzrDhyIckBxzFcceWQ86QSJulQiYxTtb_WrpPNAbRYzH5wrGftSaRwNf7vj5ruLsRM6waOOY8xw-CyLA5yZXEEV1HcFlXXvaj5ynH-RXEf9WrkMswHIe4wrc8bB2pescs1BbT3ItVLDKKWYB9JEOnMiX-uAiNH2L-WvxkEpDdkNdTOl2vGG7VMhEgU2rYCb8pJi1lSyGg
*/

type AuthData = {
  header: string | undefined;
  token: string | undefined;
  user: AuthUser;
};

export const authorization =
  (logger: Logger, getAuthUser: (token: string) => Promise<AuthUser>) =>
  async (req: Request, res: Response, next: NextFunction) =>
    compose(
      /* () => ({
        header: req.get("Authorization"),
      }),
      (data: AuthData) =>
        data.header === undefined
          ? Done.of("No authorization header")
          : NI_Next.of(data), */
      () => ({
        token: (req as any).token,
      }),
      compose(
        async (data: AuthData) => ({
          ...data,
          user: await getAuthUser(data.token as string),
        }),
        then(NI_Next.of),
        _catch((err: any) => Done.of(err))
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
      )
    )();

/* {

  try {
    const idToken = req.get("Authorization")?.split(" ")[1];

    const user = await getAuthUser(idToken as string);

    (req as any).user = user;

    logger.log("info", "AUTHORIZE", {
      USER: user,
      //DECODE_TOKEN: decodedToken,
    });

    return next();
  } catch (err) {
    logger.log("info", "UNAUTHORIZE", {
      METHOD: req.method,
      PATH: req.path,
      REQUEST_BODY: req.body,
      REQUEST_QUERY: req.query,
      AUTHORIZATION_HEADER: req.get("Authorization"),
      ERROR: err,
    });

    res.status(401).end();
  }
}
 */
