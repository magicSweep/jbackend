# Middlewares and services for backend

## Token middleware

    This middleware parse token from http header or from query param token and add it to req.token .
        Header - "Authorization": "BlaBla our-token".
        Query param - ?token=our-token

## Auth middleware

    This middleware get token from req object and try to get auth user, if successed - add it to req.user

## Check role middleware

    This middleware get user from req.user and send req to find out if this user has grants. We can provide sessionStorage to save result.

## Build and publish

- commit and push changes
- run $ npm run build:lib
- run $ npm run release
