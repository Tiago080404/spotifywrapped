import dotenv from "dotenv";
dotenv.config();
const redirect_uri = "http://127.0.0.1:5173/dashboard";

export async function fetchSpotifyToken(code: string) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.CLIENTID}:${process.env.CLIENTSECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect_uri,  // <-- muss matchen!
    }),
  });
  return res.json();
}
/* export async function fetchSpotifyToken(code): Promise<Object> {
  const client_id = process.env.CLIENTID || "";

  const redirect_uri = "http://127.0.0.1:5173/dashboard";
  const clienSecret = process.env.CLIENTSECRET!;
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: client_id,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect_uri,
      client_secret: clientSecret,
    }),
  });
  const data = await response.json();
  return data;
} */
