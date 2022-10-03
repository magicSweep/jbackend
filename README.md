# Middlewares and services for backend

## Token middleware

    This middleware parse token from http header or from query param token and add it to req.token .
        Header - "Authorization": "BlaBla our-token".
        Query param - ?token=our-token

## Auth middleware

    This middleware get token from req object and try to get auth user, if successed - add it to req.user

## Check role middleware

    This middleware get user from req.user and send req to find out if this user has grants. We can provide sessionStorage to save result.

## Multer

- multerMiddleware - main middleware where we can set all config(and file and req params validation) in one place

```javascript
import { multerMiddleware } from "jbackend/multer";

const app = express();

app.post(
  "/upload-file",
  multerMiddleware(
    {
      isFileRequired: true,
      multerLimits,
      logger,
      validateReqFile,
      validateReqParams,
      // if we wanna send some custom response on error
      responseOnError
    // create storage example we can watch at multer/storage/TestFileStreamProxyStorage
    storage
  ),
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).end();
  }
);
```

## Build and publish

- commit and push changes
- run $ npm run build:lib
- run $ npm run release
