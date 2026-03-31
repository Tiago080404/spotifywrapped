import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generateRandomString } from "./utils/generateString.js";
import { fetchSpotifyToken } from "./utils/fetchtoken.js";
import dotenv from "dotenv";
import { cors } from "hono/cors";
import { client, getCachingData, setCachingData } from "./lib/redis.js";
dotenv.config();
const redirect_uri = "http://127.0.0.1:5173/dashboard";
const app = new Hono();
app.use("/*", cors());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/login", (c) => {
  const client_id = process.env.CLIENTID || "";
  const scope =
    "user-read-private user-read-email user-top-read user-read-recently-played";
  const state = generateRandomString(16);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });
  return c.json({ url: `https://accounts.spotify.com/authorize?${params}` });
});

app.get("/exchange", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.json({ error: "code fehlt" }, 400);
  const data = await fetchSpotifyToken(code);
  const getUserId = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const user = await getUserId.json();
  return c.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user_id: user.id,
  });
});

app.get("/start", (c) => {
  return c.text("logged in");
});

app.get("/getCachedData", async (c) => {
  const userId = c.req.query("userId") || "";
  const timeRange = c.req.query("timeRange") || "";
  console.log(userId,'und die zeot',timeRange)
  const cached = await getCachingData(userId, timeRange);
  console.log(cached)
  return c.json({ cached });
});

app.post("/setCachedData", async (c) => {
  const body = await c.req.json();
  await setCachingData(body.userId, body.favTracks, 3600, body.timeRange);
  return c.json({ success: true });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
