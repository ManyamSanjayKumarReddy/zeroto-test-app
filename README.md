# zeroto-test-app

A tiny Express app for testing ZeroTo deployments.

`GET /` returns a greeting and `appName`, read from the `APP_NAME` environment variable
(`"not set"` if it isn't defined). `GET /health` returns `ok`.

## Testing an environment variable

1. In ZeroTo, open the deployment's **Variables** tab (or the New deployment page).
2. Add `APP_NAME` = `zeroto-test-app`, used by **Running app**. Save.
3. **Redeploy** — variables apply on the next deploy.
4. Open the app's URL: `appName` now shows `zeroto-test-app`. Change the value, save, redeploy, and it updates.

Locally: copy `.env.example` to `.env` and run `node index.js`.

## Using a ZeroTo managed database
The app reads `DATABASE_URL` (ZeroTo adds it when you link a database: **Databases → your database → Linked apps**, then redeploy).
`GET /db` shows the connection, and `/notes` (GET/POST/DELETE) stores notes in the database. Without a database the app still runs and these endpoints answer `503` with a hint.
The `no-dockerfile` branch has the full step-by-step test (pause, resume, persistence).
