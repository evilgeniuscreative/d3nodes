// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// if (process.env.PATH && process.env.PATH.includes("git.new")) {
//   throw new Error("Misconfigured PATH env var — do not use reserved system variables for URLs.");
// }

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TOKEN = process.env.GITHUB_TOKEN;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "../dist");

// 1. Serve built React files first
app.use(express.static(distPath));

// 2. Parse JSON for API routes
app.use(express.json());

// 3. GitHub proxy
app.post("/api/github/graphql", async (req, res) => {
  try {
    const githubRes = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    const data = await githubRes.json();
    res.status(githubRes.status).json(data);
  } catch (err) {
    console.error("GraphQL proxy error:", err);
    res.status(500).json({ error: "GitHub GraphQL fetch failed" });
  }
});

// 4. Catch-all fallback route for React SPA
app.get("*", (req, res) => {
  // Avoid treating API routes as navigation
  if (req.path.startsWith("/api/")) return res.status(404).end();
  res.sendFile(path.join(distPath, "index.html"));
});

// 5. Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
