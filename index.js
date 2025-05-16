import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import GoogleStrategy from "passport-google-oauth2";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1000 mili second = 1 sec
    }
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});


app.get("/secrets", async(req, res) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    try {
      const email = req.user.email;
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email
      ]);
      const secret = result.rows[0].secret;

      res.render("secrets.ejs", { secret });
    } catch (error) {
      res.sendStatus(500)
    }
    
  } else {
    res.redirect("/login");
  }
});

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}))

app.get("/auth/google/secrets", passport.authenticate("google", {
  successRedirect: "/secrets",
  failureRedirect: "/login",
}));

app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/");
  })
})
app.get ("/submit", (req, res) => {
  res.render("submit.ejs");
});


app.post("/submit", async(req, res) => {
  const email = req.user.email; // ✅ Get logged-in user's email
  const secret = req.body.secret;
  try {
    const result = await db.query("UPDATE users SET secret = $1 WHERE email = $2",
      [secret, email]
    )
    res.redirect("/secrets")
  } catch (error) {
    res.sendStatus(500);
    console.log("something went wrong when accessing the database")
  }
})

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("success");
            res.redirect("/secrets");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, valid) => {
          if (err) {
            //Error with password check
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              //Passed password check
              return cb(null, user);
            } else {
              //Did not pass password check
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.use("google", new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v1/certs",
}, async (accessToken, refreshToken, profile, cb) => {
  try {
    const email = profile.email;
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email
    ]);
    let user;
    if (result.rows.length > 0) {
      user = result.rows[0];
    } else {
      const insertResult = await db.query("INSERT INTO users (email) VALUES ($1) RETURNING *",[
        email
      ]);
      user = insertResult.rows[0];
    }
    cb(null, user)

  } catch (error) {
    cb(err, null);
  }
  
}));

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

/* this version is better and secure */
// passport.serializeUser((user, cb) => {
//   cb(null, user.id);
// });

// passport.deserializeUser(async (id, cb) => {
//   try {
//     const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
//     if (result.rows.length > 0) {
//       cb(null, result.rows[0]);
//     } else {
//       cb(new Error("User not found"));
//     }
//   } catch (err) {
//     cb(err);
//   }
// });


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
