import express from "express"
import { readFileSync } from "node:fs"

const app = express()
const port = process.env.PORT || 3000

// Variables the platform / base image set themselves — not something you configured.
const SYSTEM = new Set(["PATH", "HOSTNAME", "HOME", "PWD", "SHLVL", "TERM", "NODE_VERSION", "YARN_VERSION", "_"])
// Only names starting with this are shown in full. Everything else is reported as "set" + its
// length, because this app's URL is public and must never print a secret.
const PUBLIC_PREFIX = "PUBLIC_"

const userEnv = () => Object.keys(process.env).filter((k) => !SYSTEM.has(k)).sort()

app.get("/", (req, res) => {
  res.json({
    message: "Hello from ZeroTo! Updated via CI/CD 🚀",
    hostname: process.env.HOSTNAME,
    time: new Date().toISOString(),
    envVariables: userEnv().length,
    try: ["/env", "/env/NAME", "/build"],
  })
})

// Everything this running container received (the "Running app" / "Build and running app" scope).
// Values are hidden except for names starting with PUBLIC_ — add one of those to see a value.
app.get("/env", (req, res) => {
  res.json({
    note: `Values are hidden (only the length is shown) unless the name starts with ${PUBLIC_PREFIX}.`,
    port: { PORT: process.env.PORT ?? "not set", setByPlatform: true },
    variables: userEnv().map((name) => {
      const value = process.env[name] ?? ""
      return name.startsWith(PUBLIC_PREFIX) ? { name, value } : { name, set: true, length: value.length }
    }),
  })
})

// Is one specific variable visible to the running app?  /env/DB_PASSWORD
app.get("/env/:name", (req, res) => {
  const { name } = req.params
  const value = SYSTEM.has(name) ? undefined : process.env[name]
  if (value === undefined) return res.status(404).json({ name, set: false })
  res.json(name.startsWith(PUBLIC_PREFIX) ? { name, set: true, value } : { name, set: true, length: value.length })
})

// What the image BUILD saw (the "Build only" / "Build and running app" scope). build-info.json was
// written during `docker build` from the build secrets: only whether each one was present and its
// length — never the value — so the image itself holds no secret. A "Build only" variable shows up
// here but NOT in /env; a "Running app" variable shows up in /env but NOT here.
app.get("/build", (req, res) => {
  try {
    res.json({
      note: "Recorded at build time. Build-only variables appear here but not in /env.",
      builtWith: JSON.parse(readFileSync(new URL("./build-info.json", import.meta.url), "utf8")),
    })
  } catch {
    res.status(404).json({ message: "No build-info.json in this image." })
  }
})

app.get("/health", (req, res) => res.send("ok"))

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
