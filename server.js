const express = require("express");
const net = require("net");

const app = express();
const port = process.env.PORT || 3000;
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = Number(process.env.REDIS_PORT || 6379);

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

function checkRedisConnection(host, portToCheck, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (ok) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve(ok);
      }
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));

    socket.connect(portToCheck, host);
  });
}

app.get(["/", "/login"], (req, res) => {
  if (isLoggedIn(req)) {
    return res.redirect("/dashboard");
  }
  res.send(renderLoginPage());
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin") {
    res.setHeader("Set-Cookie", "auth=true; Path=/; HttpOnly");
    return res.redirect("/dashboard");
  }

  res.send(renderLoginPage("Vale kasutaja või parool"));
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

app.get("/health", async (_req, res) => {
  const redisOk = await checkRedisConnection(redisHost, redisPort);
  if (!redisOk) {
    return res.status(503).send("redis unavailable");
  }
  res.status(200).send("ok");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`App is running on http://0.0.0.0:${port}`);
});