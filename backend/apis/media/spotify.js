import queryString from "query-string";

//_ LOCAL
import { formatAxiosError, wrapResponse } from "../../utils/func.js";


export const getAuthCode = async (code, redirect_uri, spotify_accounts_client) => {
    let error = {
        present: false,
        details: null
    };
    let data = {};

    await spotify_accounts_client.request({
        method: "post",
        url: "/api/token",
        data: queryString.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri
        }),
    }).then((token_res) => {

        data = token_res.data;

    }).catch((err) => {
        error = {
            present: true,
            ...formatAxiosError(err)
        };
    });

    return wrapResponse(error, data);
};


export const getPlaylists = async (spotify_api_client) => {
    let finished = false;
    let playlist_params = {
        limit: 50,
        offset: 0
    };
    let error = {
        present: false,
        details: null
    };
    let data = [];

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

        await spotify_api_client.request({
            method: "get",
            url: "/me/playlists",
            params: playlist_params,
        })
        .then((playlist_res) => { 

            data = [...data, ...ProcessPlaylists(playlist_res.data.items)];

            if (playlist_res.data.next == null) {
                finished = true;
            } else {
                playlist_params.offset = queryString.parseUrl(playlist_res.data.next).query.offset;
            };

        })
        .catch((err) => {

            error = {
                present: true,
                ...formatAxiosError(err)
            };

            finished = true;

        });
    };

    return wrapResponse(error, data);
};


export const refreshToken = async (r_token, spotify_accounts_client) => {
    let error = {
        present: false,
        details: null
    };
    let data = {};

    await spotify_accounts_client.request({
        method: "post",
        url: "/api/token",
        data: queryString.stringify({
            grant_type: "refresh_token",
            refresh_token: r_token
        })
    }).then((token_res) => {

        data = token_res.data;

    }).catch((err) => {
        error = {
            present: true,
            ...formatAxiosError(err)
        };
    });

    return wrapResponse(error, data);
};
