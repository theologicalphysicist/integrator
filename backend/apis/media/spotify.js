import queryString from "query-string";

//_ LOCAL
import { SPOTIFY_ACCOUNTS_INSTANCE, SPOTIFY_API_INSTANCE } from "../clients.js";


export const getAuthCode = async (code, client_id, client_secret, redirect_uri) => {
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


export const getPlaylists = async (token_type, token) => {
    let playlist_response = [];
    let finished = false;
    let playlist_params = {
        limit: 50,
        offset: 0
    };

    const ProcessPlaylists = (res) => {
        let formatted_res = [];

        for (const PLAYLIST of res) {
            //* if not my playist
            //* to be varied later for a general user, using query params
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
            finished = true;
        });

    };

    return playlist_response;
};


export const refreshToken = async (r_token, client_id, client_secret) => {
    let token_response = {};

    await SPOTIFY_ACCOUNTS_INSTANCE(client_id, client_secret).request({
        method: "post",
        url: "/api/token",
        data: queryString.stringify({
            grant_type: "refresh_token",
            refresh_token: r_token
        })
    }).then((res) => {
        token_response = res.data;
    }).catch((err) => {
        console.error(`ERROR: ${err}`);
    });

    return token_response;
};
