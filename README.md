# 🔐 Secret Sharing App with Authentication

This is a Node.js + Express-based web app that allows users to **register**, **log in**, and **share their secrets** securely. It supports authentication via:
- Local strategy (username + password)
- Google OAuth 2.0

Only authenticated users can view or submit secrets.

---

## 🚀 Features

- 🧑‍💻 User registration and login (with hashed passwords using bcrypt)
- 🔐 Google OAuth 2.0 login integration
- 🗝 Session-based authentication using Passport.js
- 🧾 Secrets stored securely in PostgreSQL
- 🧼 Route protection: only logged-in users can view or submit secrets
- 📦 Environment variables support via `.env`

---

## 🛠 Tech Stack

- **Node.js** + **Express**
- **PostgreSQL** (via `pg`)
- **Passport.js** for authentication
- **bcrypt** for password hashing
- **EJS** for templating
- **dotenv** for managing environment variables

---


## 🔧 Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/your-username/secret-auth-app.git
cd secret-auth-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up PostgreSQL**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  secret TEXT
);
```

4. **Create .env file**
```env
PG_USER=your_pg_username
PG_PASSWORD=your_pg_password
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=your_database_name
SESSION_SECRET=your_random_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

5. **Run the app**
```bash
node index.js
```
Visit http://localhost:3000 in your browser.

## 🌐 Available Routes
| Route                  | Method | Description                          |
| ---------------------- | ------ | ------------------------------------ |
| `/`                    | GET    | Homepage                             |
| `/register`            | GET    | Registration form                    |
| `/register`            | POST   | Register a new user                  |
| `/login`               | GET    | Login form                           |
| `/login`               | POST   | Log in existing user                 |
| `/secrets`             | GET    | View secret (authenticated only)     |
| `/submit`              | GET    | Submit a secret (authenticated only) |
| `/submit`              | POST   | Save a secret to DB                  |
| `/logout`              | GET    | Log out the user                     |
| `/auth/google`         | GET    | Start Google OAuth2                  |
| `/auth/google/secrets` | GET    | Callback after Google auth           |


## 🛡 Security Notes
- Passwords are hashed with bcrypt before storing.
- Session cookies are used for authentication.
- Routes like /submit and /secrets are protected server-side (not just in the UI).

## 🙋‍♂️ Author
*Developed by Pawan Sankalpa.*
*Feel free to contribute or fork this project!*

## Screenshots
**Home Page**
![Home Page](<screenshot(Home Page).png>)

**Login Page**
![Login Page](<screenshot(Login Page).png>)

**Register Page**
![Register Page](<screenshot(Register Page).png>)

**Secret Page**
![Secret Page](<screenshot(Secrets Page).png>)

**Submit Page**
![Submit Page](<screenshot(submit Page).png>)

