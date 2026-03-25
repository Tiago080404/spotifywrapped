import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generateRandomString } from "./utils/generateString.js";
import { fetchSpotifyToken } from "./utils/fetchtoken.js";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const redirect_uri = `${BASE_URL}/callback`;

const app = new Hono();

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
  return c.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) {
    return c.text("Missing authorization code", 400);
  }
  const data = await fetchSpotifyToken(code);
  const params = new URLSearchParams({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
  return c.redirect(`${FRONTEND_URL}/?${params}`);
});

app.get("/start", (c) => {
  return c.text("logged in");
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
