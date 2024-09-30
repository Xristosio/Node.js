const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// FOR CRYPTO const crypto = require("crypto");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
//const csurf = require("csurf");
const { body, validationResult } = require("express-validator");
const { JWE, JWK } = require("jose");
const rateLimit = require("express-rate-limit");

dotenv.config();
("use strict");

// Αρχική Blacklist Token Array
const tokenBlacklist = [];

//SECRET_KEY GENERATE
//const SECRET_KEY = crypto.randomBytes(64).toString("hex");
const SECRET_KEY = process.env.SECRET_KEY;
//console.log(SECRET_KEY);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
//app.use(csurf({ cookie: true }));

//ΑΣΦΑΛΕΙΑ Επίτρεψε αιτήματα μόνο από το συγκεκριμένο domain
//Αν η εφαρμογή σου χρησιμοποιεί διαφορετικά domains, θα πρέπει να προσθέσεις το cors middleware για να ελέγχεις ποια domains επιτρέπονται να έχουν πρόσβαση.
// Allow CORS
// Διαμόρφωση CORS για να επιτρέπουμε τα cookies
app.use(
  cors({
    origin: "http://127.0.0.1:8080", // Το origin του frontend σου
    //methods: ["GET", "POST", "PUT", "DELETE"], // Specify the allowed HTTP methods
    //allowedHeaders: ["Content-Type", "Authorization"], // Specify the allowed headers
    credentials: true, // Επιτρέπει την αποστολή cookies
  })
);

//Για να αποτρέψεις brute force επιθέσεις, μπορείς να προσθέσεις το express-rate-limit για να περιορίσεις τον αριθμό αιτημάτων που επιτρέπονται από έναν συγκεκριμένο χρήστη.
// Προσθέτουμε τον περιορισμό
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 λεπτά
  max: 100, // Μέγιστο 100 αιτήματα ανά IP κάθε 15 λεπτά
  message: "Too many requests from this IP, please try again later.",
});

//Με το helmet μπορείς να προσθέσεις Content Security Policy (CSP) για να περιορίσεις τις πηγές που επιτρέπονται να φορτωθούν στην εφαρμογή σου.
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  })
);

app.use(limiter); // Εφαρμόζουμε το rate limiting σε όλα τα αιτήματα

const users = [
  {
    id: 1,
    email: "cioa15@yahoo.gr",
    password: "user1",
  },
];

//LOGIN
//Χρησιμοποίησε τη βιβλιοθήκη express-validator για να ελέγχεις και να καθαρίζεις τα δεδομένα των χρηστών, ώστε να προστατεύεσαι από SQL Injection και XSS επιθέσεις.
app.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (user.password === password) {
      const token = jwt.sign({ email: email }, SECRET_KEY, {
        expiresIn: "15m",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        //sameSite: "None",
        path: "/",
      });

      res.json({ message: "Login successful", token: token });
    } else {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  }
);

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  if (tokenBlacklist.includes(token)) {
    return res.status(403).json({ message: "Token has been blacklisted" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid Token" });
    }
    next();
  });
}

app.get("/verify", authenticateToken, (req, res) => {
  res.json({ message: "Token is Valid" });
});

app.post("/logout", (req, res) => {
  const token = req.cookies.token;

  if (token) {
    tokenBlacklist.push(token);
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // Αν έχεις HTTPS, βάλε true
  });

  res.json({ message: "Logout successful" });
});

app.listen(process.env.PORT, () => console.log("Run on http://localhost:3000"));

//Μπορει να αποθηκευεται το token σε μια βαση δεδομενων και να διαγραφεται οταν τελει΄ώσει ο χρόνος της ζωής του. Ετσι δεν θα γεμίζει η βαση και δεν θα χρειαζεται πολυ χρονο για να ψαξει την λιστα.
