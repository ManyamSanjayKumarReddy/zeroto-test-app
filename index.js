import express from "express"

const app = express()
const port = process.env.PORT || 3000

app.get("/", (req, res) => {
  res.json({
    message: "Hello from ZeroTo!",
    hostname: process.env.HOSTNAME,
    time: new Date().toISOString(),
  })
})

app.get("/health", (req, res) => res.send("ok"))

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
