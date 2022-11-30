import { URLSearchParams, fileURLToPath } from "url";
import queryString from "querystring";

export const SPOTIFY_URL = 'https://accounts.spotify.com/';

const generateRandomString = (length) => {
    let text = '';
    const POSSIBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
    }
    return text;
  };
  

const SpotifyAuth = () => {

    return "";
}

export const SpotifyFetch = (req, res) => {
    res.redirect(`${SPOTIFY_URL}authorize?${queryString.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        redirect_uri: "http://localhost:3000/spotify_callback",
        scope: "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public, user-library-modify user-library-read user-read-email user-read-private"
    })}`);
}