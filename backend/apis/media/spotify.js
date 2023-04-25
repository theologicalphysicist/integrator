import queryString from "query-string";
import { SPOTIFY_ACCOUNTS_INSTANCE, SPOTIFY_API_INSTANCE } from "../clients.js";

//- LOCAL
import { SPOTIFY_API_URL } from "../../utils.js";

export const getTokens = async (code, client_id, client_secret, redirect_uri) => {
    let token_response = {};

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


export const getPlaylists = async (token_type, token) => {
    let playlist_response = [];
    let finished = false;
    let playlist_params = {
        limit: 50,
        offset: 0
    };

    while (!finished) {
        await SPOTIFY_API_INSTANCE(token_type, token).request({
            method: "get",
            url: "/me/playlists",
            params: playlist_params,
        }).then((res) => { 
            playlist_response = [...playlist_response, ...ProcessPlaylists(res.data.items)];

            if (res.data.next == null) {
                finished = true;
            } else {
                const NEXT_PARAMS = queryString.parseUrl(res.data.next).query;
                playlist_params.offset = NEXT_PARAMS.offset;
            };

        }).catch((err) => {
            console.log(`ERROR: ${err}`);
            playlist_response = {err};
        });

    }


    return playlist_response;
};


export const refreshToken = (refresh_token) => {

}