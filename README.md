# zeroto-test-app

A tiny Express app for testing ZeroTo deployments.

| Endpoint | Shows |
|---|---|
| `/` | greeting, and how many variables the app has |
| `/env` | every variable the **running** app received (hidden values: only the length; names starting `PUBLIC_` are shown in full) |
| `/env/NAME` | whether one variable is visible to the running app |
| `/build` | which of `BUILD_TOKEN`, `BUILD_FLAG`, `NPM_TOKEN` reached the image **build** (presence + length only) |
| `/health` | `ok` |

## Testing environment variables

In ZeroTo (on the New deployment page, or the deployment's **Variables** tab) add the variables below — or copy [`.env.example`](.env.example) and use **Add from .env** (it has a section for each "Used by" choice):

| Name | Used by | Secret | Expect |
|---|---|---|---|
| `PUBLIC_GREETING` = `hello` | Running app | no | `/env` shows the value `hello` |
| `DB_PASSWORD` = `s3cret-value` | Running app | yes | `/env` shows `set`, length 12 — never the value |
| `BUILD_TOKEN` = `build-secret-123` | Build only | yes | `/build` shows `present: true`; **not** in `/env` |
| `NPM_TOKEN` = `x` | Build and running app | yes | in both `/build` and `/env` |

Variables apply on the next deploy: save, then **Redeploy**. Changing only a "Running app"
variable still needs a redeploy; the running app keeps what it was deployed with until then.
