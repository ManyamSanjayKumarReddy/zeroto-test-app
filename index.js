import express from "express"
import pg from "pg"

// Locally, read variables from a .env file if there is one. On ZeroTo there is no file: the
// platform sets the variables you add in the Variables tab — and, when you link a database,
// DATABASE_URL.
try {
  process.loadEnvFile()
} catch {
  /* no .env file — fine */
}

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

// The UI test site (a separate static site) calls this app from the browser, so allow it.
app.use((req, res, next) => {
  res.set("access-control-allow-origin", "*")
  res.set("access-control-allow-headers", "content-type")
  res.set("access-control-allow-methods", "GET,POST,DELETE,OPTIONS")
  if (req.method === "OPTIONS") return res.sendStatus(204)
  next()
})

// ── Database ────────────────────────────────────────────────────────────────
// Linking a database in ZeroTo adds DATABASE_URL to this app's variables; redeploy to pick it up.
// Nothing here connects at startup, so the app runs fine without a database — and keeps running if
// the database is paused or deleted later (the database endpoints then answer 503 with the reason).
const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 })
  : null
// Without this, a connection the database drops (a pause, a restart) would crash the whole app.
pool?.on("error", (err) => console.error("database connection error:", err.message))

let tableReady = null
function ensureTable() {
  tableReady ??= pool
    .query("create table if not exists notes (id serial primary key, text text not null, created_at timestamptz not null default now())")
    .catch((err) => {
      tableReady = null // try again on the next request
      throw err
    })
  return tableReady
}

/** Runs `work` against the database, or answers 503 saying why it can't. */
function withDatabase(work) {
  return async (req, res) => {
    if (!pool) {
      return res.status(503).json({ linked: false, hint: "No DATABASE_URL. In ZeroTo: Databases → your database → Linked apps → pick this app, then redeploy." })
    }
    try {
      await ensureTable()
      await work(req, res)
    } catch (err) {
      console.error("database error:", err.message)
      res.status(503).json({ linked: true, connected: false, error: err.message })
    }
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "Hello from ZeroTo! Built without a Dockerfile 🚀",
    appName: process.env.APP_NAME ?? "not set",
    database: pool ? "DATABASE_URL is set — try /db and /notes" : "not linked — link a database in ZeroTo, redeploy, then try /db",
    hostname: process.env.HOSTNAME,
    time: new Date().toISOString(),
  })
})

app.get("/health", (req, res) => res.send("ok"))

// Proof the link works: who we are connected as, to what.
app.get(
  "/db",
  withDatabase(async (req, res) => {
    const { rows } = await pool.query("select now() as time, current_database() as database, current_user as user, version() as version")
    res.json({ linked: true, connected: true, ...rows[0] })
  }),
)

// A tiny notes list stored in the database.
app.get(
  "/notes",
  withDatabase(async (req, res) => {
    const { rows } = await pool.query("select id, text, created_at from notes order by id desc limit 50")
    res.json({ count: rows.length, notes: rows })
  }),
)

app.post(
  "/notes",
  withDatabase(async (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : ""
    if (!text || text.length > 200) return res.status(400).json({ error: "Send JSON like {\"text\": \"hello\"} (1–200 characters)." })
    const { rows } = await pool.query("insert into notes (text) values ($1) returning id, text, created_at", [text])
    res.status(201).json(rows[0])
  }),
)

app.delete(
  "/notes/:id",
  withDatabase(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) return res.status(400).json({ error: "id must be a number" })
    const { rowCount } = await pool.query("delete from notes where id = $1", [id])
    res.status(rowCount ? 204 : 404).end()
  }),
)

app.listen(port, () => {
  console.log(`Listening on port ${port}${pool ? " (database configured)" : " (no database)"}`)
})
