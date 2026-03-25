import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:3000";

interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export async function fetchSpotifyToken(code: string): Promise<SpotifyTokenResponse> {
  const client_id = process.env.CLIENTID || "";
  const redirect_uri = `${BASE_URL}/callback`;
  const clientSecret = process.env.CLIENTSECRET!;
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
}
