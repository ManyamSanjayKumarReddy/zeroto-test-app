# zeroto-test-app — `no-dockerfile` branch

The same tiny Express app as `main`, **without a Dockerfile**, for testing ZeroTo's no-Dockerfile builds (Phase 3).
(`main` keeps its Dockerfile, so it tests the Dockerfile path.)

`GET /` returns a greeting and `appName`, read from the `APP_NAME` environment variable (`"not set"` if it isn't defined). `GET /health` returns `ok`.
The `site/` folder is a plain static site.

## Test 1 — the app, detected automatically
1. New deployment → pick this repo, branch **`no-dockerfile`**. Leave **Build** on *Automatic* and everything else empty.
2. Deploy. The build log says `No Dockerfile — building … with Railpack`.
3. Open the URL: you get JSON with `"Built without a Dockerfile"`.

## Test 2 — a variable
Add `APP_NAME` = `zeroto-test-app` (Used by: *Running app*), redeploy, and `appName` shows it.

## Test 3 — a build setting
Settings → Build → **Start command** `node index.js`, save, redeploy. It starts the same way (the setting is used instead of the detected one).
Try a wrong one (`node nope.js`): the app fails to start and the logs say why. Clear it and redeploy to recover.

## Test 4 — a static site with a root directory
New deployment, same repo and branch, **Root directory** = `site`. Deploy. Opening the URL shows the static page ("Hello from a static site").

## Test 5 — a clear failure
Set **Root directory** to `nope` and redeploy: the build fails with `The root directory "nope" doesn't exist in this branch of your repository.`

Locally: copy `.env.example` to `.env` and run `node index.js`.
