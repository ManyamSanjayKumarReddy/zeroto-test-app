# zeroto-test-app — `no-dockerfile` branch

The same tiny Express app as `main`, **without a Dockerfile**, for testing ZeroTo's no-Dockerfile builds (Phase 3).
(`main` keeps its Dockerfile, so it tests the Dockerfile path.)

`GET /` returns a greeting and `appName`, read from the `APP_NAME` environment variable (`"not set"` if it isn't defined). `GET /health` returns `ok`.
The `site/` folder is a plain static site. The app can also use a **ZeroTo managed database** (Test 6): `GET /db`, and a tiny notes API at `/notes`.

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

## Test 6 — a managed database (Pro plans)
1. **Databases → New database** (e.g. `notes-db`). Wait until it says **Running**.
2. Open it → **Linked apps** → choose this deployment → **Link app** (leave the variable name as `DATABASE_URL`).
   ZeroTo adds `DATABASE_URL` to this app as a secret variable and tells you to redeploy.
3. **Redeploy** the app. Then:
   - `GET /` now says `database: "DATABASE_URL is set — try /db and /notes"`.
   - `GET /db` → `{"linked":true,"connected":true,"database":"app","user":"app",...}` — proof the app reached the database.
   - Add a note: `curl -X POST https://<your-url>/notes -H 'content-type: application/json' -d '{"text":"hello"}'`, then `GET /notes` lists it.
4. **Persistence:** redeploy the app again — the notes are still there (they live in the database, not the app).
5. **Pause:** on the database page press **Pause**. `/notes` answers `503` with the reason, but `/health` still says `ok` (the app doesn't crash). Press **Start** — within a few seconds `/notes` works again.
6. **Not linked:** unlink the app (and redeploy): `/db` answers `503` with a hint, `/` says `not linked`.

The app creates its `notes` table itself and never prints `DATABASE_URL`.

## Test 7 — a UI that talks to this app
The separate repo **zeroto-ui-test** is a static site (Vite) with a page that calls this app's `/` and `/notes`. Deploy it as its own deployment and point its `VITE_API_URL` at this app's URL — see that repo's README.

Locally: copy `.env.example` to `.env` and run `node index.js` (set `DATABASE_URL` in it to try the database endpoints).
