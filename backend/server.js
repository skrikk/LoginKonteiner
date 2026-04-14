const express = require("express");
const { createClient } = require("redis");

const app = express();

const PORT = process.env.PORT || 4000;
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

app.use(express.json());

const redisClient = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});

let redisReady = false;

redisClient.on("error", (err) => {
  redisReady = false;
  console.error("Redis error:", err.message);
});

redisClient.on("connect", () => {
  console.log("Connecting to Redis...");
});

redisClient.on("ready", () => {
  redisReady = true;
  console.log("Redis connection is ready.");
});

redisClient.on("end", () => {
  redisReady = false;
  console.log("Redis connection closed.");
});

async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    redisReady = false;
    console.error("Initial Redis connection failed:", error.message);
  }
}

app.get("/health", async (_req, res) => {
  if (!redisReady) {
    return res.status(503).json({
      status: "error",
      app: "up",
      redis: "down",
    });
  }

  res.json({
    status: "ok",
    app: "up",
    redis: "up",
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Username and password are required.",
    });
  }

  if (!redisReady) {
    return res.status(503).json({
      success: false,
      message: "Redis is not available.",
    });
  }

  if (username === "admin" && password === "admin") {
    try {
      await redisClient.set(`last-login:${username}`, new Date().toISOString());

      return res.json({
        success: true,
        message: "Login successful",
      });
    } catch (error) {
      console.error("Failed to write to Redis:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to store login information.",
      });
    }
  }

  res.status(401).json({
    success: false,
    message: "Invalid username or password",
  });
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Backend is running on http://0.0.0.0:${PORT}`);
  console.log(`Redis target: ${REDIS_HOST}:${REDIS_PORT}`);

  await connectRedis();
});