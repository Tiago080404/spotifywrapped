import dotenv from "dotenv";
dotenv.config();

export async function fetchSpotifyToken(code: string, redirect_uri: string = "http://127.0.0.1:5173/dashboard") {
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

export async function refreshSpotifyToken(refreshToken: string) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.CLIENTID}:${process.env.CLIENTSECRET}`,
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  return res.json();
}
