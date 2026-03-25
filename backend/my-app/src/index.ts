import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generateRandomString } from "./utils/generateString.js";
import { fetchSpotifyToken } from "./utils/fetchtoken.js";
import dotenv from "dotenv";
import { cors } from "hono/cors";
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
  console.log("hfjfjdfkdkd");
  return c.json({ url: `https://accounts.spotify.com/authorize?${params}` });
});

app.get("/exchange", async (c) => {
  const code = c.req.query("code");
  const data = await fetchSpotifyToken(code);
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
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
