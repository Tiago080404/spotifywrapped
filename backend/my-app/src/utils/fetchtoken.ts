import dotenv from "dotenv";
dotenv.config();
const redirect_uri = "http://127.0.0.1:5173/dashboard";

export async function fetchSpotifyToken(code: string) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.CLIENTID}:${process.env.CLIENTSECRET}`,
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirect_uri,
    }),
  });
  return res.json();
}
