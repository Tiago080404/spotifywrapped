import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { generateRandomString } from "./utils/generateString.js";
import { fetchSpotifyToken } from "./utils/fetchtoken.js";
import dotenv from "dotenv";
dotenv.config();
var redirect_uri = "http://127.0.0.1:3000/callback";
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/login", (c) => {
   const client_id = process.env.CLIENTID || "";
  console.log("clientid", client_id); 
  let scope =
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
  return c.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get("/callback", async (c) => {
  const code = c.req.query("code");
  console.log("callback", code);
  if (!code) {
    return c.text("Missing authorization code", 400);
  }
  const data = await fetchSpotifyToken(code);
  const params = new URLSearchParams({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
  return c.redirect(`http://localhost:5173/?${params}`);
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
