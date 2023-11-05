import queryString from "query-string";
import type { AxiosResponse, AxiosError, AxiosInstance } from "axios";

//_ LOCAL
import { checkEnvironment, formatAxiosError, wrapResponse } from "../../utils/func.js";
import { ErrorResponse, GeneralResponse, Playlist, PlaylistParameters, Song } from "../../utils/types.js";
import { Verbal } from "../../utils/logger.js";


//_ TOKENS & AUTH
export const getAuthCode = async (code: string, redirect_uri: string, spotify_accounts_client: AxiosInstance, logger: Verbal): Promise<GeneralResponse> => {
    let error: ErrorResponse = {
        present: false,
        details: null
    };
    let data: any = {};

    await spotify_accounts_client.request({
        method: "post",
        url: "/api/token",
        data: queryString.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirect_uri
        }),
    }).then((token_res: AxiosResponse) => {

        data = token_res.data;

    }).catch((err: AxiosError) => {

        error = {
            present: true,
            ...formatAxiosError(err)
        };

        logger.error(error);

    });

    return wrapResponse(error, data);
};


export const refreshToken = async (r_token: string, spotify_accounts_client: AxiosInstance, logger: Verbal): Promise<GeneralResponse> => {
    let error: ErrorResponse = {
        present: false,
        details: null
    };
    let data: any = {};

    await spotify_accounts_client.request({
        method: "post",
        url: "/api/token",
        data: queryString.stringify({
            grant_type: "refresh_token",
            refresh_token: r_token
        })
    }).then((token_res: AxiosResponse) => {

        data = token_res.data;

    }).catch((err: AxiosError) => {

        error = {
            present: true,
            ...formatAxiosError(err)
        };

    });

    return wrapResponse(error, data);
};


//_ PLAYLISTS
export const getPlaylists = async (spotify_api_client: AxiosInstance, logger: Verbal): Promise<GeneralResponse> => {
    let finished: boolean = false;
    let playlist_params: PlaylistParameters = {
        limit: 50,
        offset: 0
    };
    let error: ErrorResponse = {
        present: false,
        details: null
    };
    let data: Playlist[] = [];

    const ProcessPlaylists = (res: any): Playlist[] => {
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
        }).then((playlist_res: AxiosResponse) => { 
            logger.log(playlist_res.data);

            data = [...data, ...ProcessPlaylists(playlist_res.data.items)];

            if (playlist_res.data.next == null) {
                finished = true;
            } else {
                playlist_params.offset = queryString.parseUrl(playlist_res.data.next).query.offset?.toString();
            };

        }).catch((err: AxiosError) => {
            logger.error(err.toJSON());

            error = {
                present: true,
                ...formatAxiosError(err)
            };

            finished = true;

        });
    };

    return wrapResponse(error, data);
};


export async function createPlaylist(api_client: AxiosInstance, user_id: string, playlist_name: string, logger: Verbal, playlist_desc?: string): Promise<GeneralResponse> {
    let error: ErrorResponse = {
        present: false,
        details: null
    };
    let data: any = {};

    await api_client.request({
        method: "POST",
        url: `/users/${user_id}/playlists`,
        data: {
            name: playlist_name,
            description: playlist_desc,
            public: false
        }
    }).then((playlist_res: AxiosResponse) => {

        logger.info(playlist_res.data);

        data = playlist_res.data;

    }).catch((err: any) => {
        logger.error({err});

        error = {
            present: true,
            ...formatAxiosError(err)
        };

    });

    return wrapResponse(error, data);
};


//_ SEARCHING
export async function querySong(spotify_api_client: AxiosInstance, logger: Verbal, song: Song): Promise<GeneralResponse> {
    let error: ErrorResponse = {
        present: false,
        details: null
    };
    let data: any = {};
    let query: string = `remaster`;

    song.ISRC != null ? query += ` isrc:${song.ISRC}` : null;

    await spotify_api_client.request({
        method: "get",
        url: "/search",
        params: {
            q: `${query} track:${song.name} artist:${song.artist}`,
            type: "track",
            market: "GB"
        }
    })
    .then((search_res: AxiosResponse) => {
        if (process.env.NODE_ENV == "local") logger.debug(search_res.data);

        data = search_res.data;

    })
    .catch((err: AxiosError) => {
        if (process.env.NODE_ENV == "local") logger.error(err.message);

        error = {
            present: true,
            ...formatAxiosError(err)
        };

    });

    return wrapResponse(error, data);
};


//_ USER
export async function getCurrentUser(spotify_api_client: AxiosInstance, logger: Verbal): Promise<GeneralResponse> {
    let error: ErrorResponse = {
        present: false,
        details: null
    };
    let data: any = {};

    await spotify_api_client.request({
        method: "GET",
        url: "/me"
    }).then((user_res: AxiosResponse) => {

        if (checkEnvironment()) logger.info(user_res.data);

        data = user_res.data;

    }).catch((err: AxiosError) => {
        logger.error({err});
        
        if (checkEnvironment()) logger.error(err.message);

        error = {
            present: true,
            ...formatAxiosError(err)
        };

    });

    return wrapResponse(error, data);
};