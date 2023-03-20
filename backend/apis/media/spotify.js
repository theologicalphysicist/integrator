import queryString from "querystring";
import axios from "axios";
import Request from "request";

export const SPOTIFY_ACCOUNTS_URL = 'https://accounts.spotify.com';
export const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

//TODO: REFACTOR THIS MODULE USING EXPORTED INSTANCES, AND FINALISE AUTH, OR USE MODULE

export const generateRandomString = (length) => {
    let text = '';
    const POSSIBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
        text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
    }
    return text;
};

export const AuthoriseUser = (res, state_str, redirect_URI) => {
    const QS = queryString.stringify({
            response_type: "code",
            client_id: process.env.SPOTIFY_CLIENT_ID,
            redirect_uri: redirect_URI,
            scope: process.env.SPOTIFY_SCOPES,
            state: state_str,
    });
    res.redirect(302, `${SPOTIFY_ACCOUNTS_URL}/authorize?${QS}`);
}

export const getTokens = async (auth_options, res) => {

    Request.post(auth_options, (err, token_res, body) => {
        if (err || token_res.statusCode != 200) {
            console.error(`ERROR: ${body.error}`);
        } else {
            res.send({
                accessToken: body.access_token,
                refreshToken: body.refresh_token,
                scope: body.scope,
                expiry: body.expires_in
            });
        }
    });
}

const ProcessPlaylists = (res) => {
    let formatted_res = [];

    for (const PLAYLIST of res) {
        PLAYLIST.owner.display_name === "gauss" ? formatted_res.push({
            imageURL: PLAYLIST.images[0].url,
            name: PLAYLIST.name,
            ownerName: PLAYLIST.owner.display_name,
            length: PLAYLIST.tracks.total,
            type: PLAYLIST.type,
        }) : "";
    }

    return formatted_res;
}

export const getPlaylists = async (auth_options, res) => {
    Request.post(auth_options, async (err, auth_res, body) => {
        let playlist_response = [];
        if (err || auth_res.statusCode !== 200) {
            console.log(err);
            console.log("UNSUCCESSFUL");
        } else {
            let index = 0;
            let next = "";
            while (next !== null) {
                const OPTIONS = {
                    method: "GET",
                    url: `${SPOTIFY_API_URL}/me/playlists`,
                    params: {
                        offset: index,
                        limit: 50
                    },
                    headers: {
                        "Authorization": `Bearer ${body.access_token}`,
                    }
                };    
                // Request.get(OPTIONS, (err, playlist_res, playlist_body) => {
                //     if (err || playlist_res.statusCode !== 200) {
                //         console.error(playlist_body.error.message);
                //     } else {
                //         next = playlist_body.next;
                //         offset = playlist_body.offset
                //         playlist_response.push(ProcessPlaylists(playlist_body.items));
                //         console.log(playlist_response);
                //     }
                // });
                await axios(OPTIONS)
                .then((playlist_res) => {
                    next = playlist_res.data.next;
                    index = playlist_res.data.limit
                    playlist_response.push(ProcessPlaylists(playlist_res.data.items));
                }).catch(err => {
                    console.error(`ERROR \n STATUS CODE: ${err.response} \n STATUS TEXT: ${err.response}`);
                });
            }
            res.send(playlist_response.flat());
        }
    });
}

export const ErrorRedirect = (err, req, res) => {
    console.error(err);
    // res.redirect("/#" + queryString.stringify({
    //     error: err
    // }));
}