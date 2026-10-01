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
