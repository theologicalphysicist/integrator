import queryString from "query-string";
import axios from "axios";
import Request from "request";
import { SPOTIFY_ACCOUNTS_INSTANCE, SPOTIFY_API_INSTANCE } from "../clients.js";

//- LOCAL
import { SPOTIFY_API_URL } from "../../utils.js";

export const getTokens = async (code, client_id, client_secret, redirect_uri) => {
    let token_response;

    await SPOTIFY_ACCOUNTS_INSTANCE(client_id, client_secret).request({
        method: "post",
        url: "/api/token",
        data: queryString.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri
        }),
    }).then((token_res) => {
        console.log(token_res.data);
        token_response = token_res.data;
    }).catch((err) => {
        console.log(`ERROR: ${err}`);
        token_response = "ERROR";
    });

    return token_response;
};


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
    };

    return formatted_res;
};


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