import { URLSearchParams, fileURLToPath } from "url";
import queryString from "querystring";
import Request from "request"

export const SPOTIFY_URL = 'https://accounts.spotify.com/';

export const SpotifyAuthTokens = (req, res, authOptions) => {
    let response;
    Request.post(authOptions, (err, token_res, body) => {
        if (err || token_res.statusCode !== 200) {
            SpotifyAuthError(err, req, res);
        } else {
            res.cookie("tokens", {
                accessToken: body.access_token,
                tokenType: body.token_type,
                expiry: body.expires_in,
                refreshToken: body.refresh_token,
            });
            res.redirect("/spotify_success");
        };
    });
    return response;
}

export const SpotifyAuthUser = (req, res, state_str) => {
    res.redirect(`${SPOTIFY_URL}authorize?${queryString.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        redirect_uri: "http://localhost:3000/spotify_callback",
        scope: "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public, user-library-modify user-library-read user-read-email user-read-private",
        state: state_str
    })}`);
}

export const SpotifyAuthError = (err, req, res) => {
    res.redirect("/#" + queryString.stringify({
        error: err
    }));
}