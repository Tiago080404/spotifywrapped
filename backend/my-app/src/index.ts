import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generateRandomString } from "./utils/generateString.js";
import { fetchSpotifyToken, refreshSpotifyToken } from "./utils/fetchtoken.js";
import dotenv from "dotenv";
import { cors } from "hono/cors";
dotenv.config();
const app = new Hono();
app.use("/*", cors());

// Build redirect_uri dynamically from the request's origin hostname
function getRedirectUri(c: any): string {
  // Try Origin header first, then Referer, then fallback
  const origin = c.req.header("origin") || c.req.header("referer") || "";
  try {
    const url = new URL(origin);
    // Preserve the original protocol and port from the frontend
    return `${url.protocol}//${url.hostname}:${url.port || (url.protocol === "https:" ? "443" : "5173")}/dashboard`;
  } catch {
    return "https://127.0.0.1:5173/dashboard";
  }
}

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/login", (c) => {
  const client_id = process.env.CLIENTID || "";
  const redirect_uri = getRedirectUri(c);
  const scope =
    "user-read-private user-read-email user-top-read user-read-recently-played user-library-read streaming user-modify-playback-state user-read-playback-state playlist-modify-private playlist-modify-public";
  const state = generateRandomString(16);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });
  console.log(`Login redirect_uri: ${redirect_uri}`);
  return c.json({ url: `https://accounts.spotify.com/authorize?${params}` });
});

app.get("/exchange", async (c) => {
  const code = c.req.query("code");
  const redirect_uri_param = c.req.query("redirect_uri");
  if (!code) return c.json({ error: "code fehlt" }, 400);
  // Use the redirect_uri passed from the frontend (must match what was used in /login)
  const redirect_uri = redirect_uri_param || getRedirectUri(c);
  const data = await fetchSpotifyToken(code, redirect_uri);
  return c.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
});

app.get("/refresh", async (c) => {
  const refreshToken = c.req.query("refresh_token");
  if (!refreshToken) return c.json({ error: "refresh_token fehlt" }, 400);
  const data = await refreshSpotifyToken(refreshToken);
  return c.json({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
});

app.get("/start", (c) => {
  return c.text("logged in");
});
serve(
  {
    fetch: app.fetch,
    port: 3000,
    hostname: "0.0.0.0",
  },
  (info) => {
    console.log(`Server is running on http://0.0.0.0:${info.port}`);
  },
);
