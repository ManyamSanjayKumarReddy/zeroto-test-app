import express from "express"

// Locally, read variables from a .env file if there is one. On ZeroTo there is no file: the
// platform sets the variables you add in the Variables tab.
try {
  process.loadEnvFile()
} catch {
  /* no .env file — fine */
}

const app = express()
const port = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.json({
    message: "Hello from ZeroTo! Built without a Dockerfile 🚀",
    appName: process.env.APP_NAME ?? "not set",
    hostname: process.env.HOSTNAME,
    time: new Date().toISOString(),
  })
})

app.get("/health", (req, res) => res.send("ok"))

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
