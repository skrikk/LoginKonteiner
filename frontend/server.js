const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

app.use(express.urlencoded({ extended: true }));

function renderLoginPage(message = "", bgColor = "#e6f0ff") {
  return `
    <!DOCTYPE html>
    <html lang="et">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Login</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: ${bgColor};
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .card {
          background: white;
          padding: 32px;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          width: 320px;
        }
        h1 {
          margin-top: 0;
          text-align: center;
        }
        label {
          display: block;
          margin-top: 12px;
          margin-bottom: 6px;
          font-weight: bold;
        }
        input {
          width: 100%;
          padding: 10px;
          box-sizing: border-box;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        button {
          width: 100%;
          margin-top: 16px;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          font-size: 16px;
          cursor: pointer;
        }
        .message {
          margin-top: 16px;
          text-align: center;
          font-weight: bold;
          color: #1f2937;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Login</h1>
        <form method="POST" action="/login">
          <label for="username">Username</label>
          <input id="username" name="username" type="text" required />

          <label for="password">Password</label>
          <input id="password" name="password" type="password" required />

          <button type="submit">Log in</button>
        </form>
        ${message ? `<div class="message">${message}</div>` : ""}
      </div>
    </body>
    </html>
  `;
}

function renderDashboard() {
  return `
    <!DOCTYPE html>
    <html lang="et">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Dashboard</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #d1fae5;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        button {
          margin-top: 20px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Oled sisselogitud</h2>
        <form method="POST" action="/logout">
          <button type="submit">Logi välja</button>
        </form>
      </div>
    </body>
    </html>
  `;
}

function isLoggedIn(req) {
  return (req.headers.cookie || "").includes("auth=true");
}

app.get(["/", "/login"], (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect("/dashboard");
  }

  res.send(renderLoginPage());
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const response = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      res.setHeader("Set-Cookie", "auth=true; Path=/; HttpOnly");
      return res.redirect("/dashboard");
    }

    return res.send(renderLoginPage(data.message || "Login failed"));
  } catch (error) {
    console.error("Backend request failed:", error.message);

    return res.send(
      renderLoginPage("Backend is unavailable. Please try again later.", "#fee2e2")
    );
  }
});

app.get("/dashboard", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect("/login");
  }

  res.send(renderDashboard());
});

app.post("/logout", (_req, res) => {
  res.setHeader("Set-Cookie", "auth=; Max-Age=0; Path=/");
  res.redirect("/login");
});

app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend is running on http://0.0.0.0:${PORT}`);
  console.log(`Backend target: ${BACKEND_URL}`);
});