const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = XXXX;

const pool = new Pool({
  user: "XXXX",
  host: "XXXX",
  database: "XXXX",
  password: "XXXX",
  port: XXXX,
});

// Allow CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Για να επιτρέπεται η διαχείριση JSON requests
app.use(express.json());

// Διαδρομή GET
//app.get("/data", function) Arrow Function
app.get("/data", async (req, res) => {
  await pool.connect();

  const result = await pool.query("SELECT * FROM testTable");
  let x = [];
  const y = result.rows.length;
  for (let i = 0; i < y; i++) {
    x[i] = result.rows[i];
  }

  res.send(x);
});

// Εκκίνηση του server
app.listen(port, () => {
  console.log(`Το API τρέχει στο http://mydomain.gr:${port}`);
});
