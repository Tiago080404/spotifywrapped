import dotenv from "dotenv";
dotenv.config();
export async function fetchSpotifyToken(code): Promise<Object> {
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
