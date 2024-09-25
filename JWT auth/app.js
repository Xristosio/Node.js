//const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
//const { Pool } = require("pg");
("use strict");

const app = express();
const SECRET_KEY = "random";

// const pool = new Pool({
//   user: "XXXX",
//   host: "XXXX",
//   database: "XXXX",
//   password: "XXXX",
//   port: XXXX,
// });

app.use(express.json());

const users = [
  {
    id: 1,
    email: "test@gmail.com",
    password: "user1",
  },
];

// Allow CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:8080");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  if (user.password === password) {
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token });
    console.log(token);
  } else {
    res.status(400).json({ message: "Invalid email or password" });
  }
});

app.listen(3000, () => console.log("Run on http://localhost:3000"));
