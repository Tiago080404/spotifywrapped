import dotenv from "dotenv";
dotenv.config();
interface SpotifyTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export async function fetchSpotifyToken(code: string): Promise<SpotifyTokenResponse> {
  const client_id = process.env.CLIENTID || "";

  var redirect_uri = "http://127.0.0.1:3000/callback";
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
      client_secret: clienSecret,
    }),
  });
  const data = await response.json();
  return data;
}
