import queryString from "query-string";
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


export const getPlaylists = async (client_id, client_secret, auth) => {
    let playlist_response = {};

    await SPOTIFY_API_INSTANCE(client_id, client_secret).request({
        method: "get",
        url: "/me/playlists",
        headers: {
            "Authorization": `${auth}`
        },
        params: {
            limit: 50,
            offset: 0
        },
    }).then((res) => { 
        playlist_response = ProcessPlaylists(res.data.items);
    }).catch((err) => {
        console.log(`ERROR: ${err}`);
        playlist_response = {err};
    });

    return playlist_response;
};


export const refreshToken = (refresh_token) => {

}