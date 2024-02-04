import jsonfile from "jsonfile";

import { ErrorResponse, GeneralResponse } from "../../utils/types.js";
import { wrapResponse } from "../../utils/func.js";
import { ERROR_CODES, ERROR_MESSAGE } from "../../utils/error.js";
import { Verbal } from "../../utils/logger.js";


const APPLE_MUSIC_PATH = "./.cache/applemusic.json";


//_ PLAYLISTS
export async function getAppleMusicPlaylist(logger: Verbal, include_songs: boolean, playlist_names?: string[]): Promise<GeneralResponse> {
    let error: ErrorResponse = {
        present: false,
    };
    let data: any[] = [];

    await jsonfile.readFile(
        APPLE_MUSIC_PATH,
        {
            encoding: "utf-8"
        }
    ).then((apple_music_res: any[]) => {

        if (playlist_names) apple_music_res.forEach((p: any) => {
            if (playlist_names.includes(p.name)) data.push(
                include_songs ? p : p.name
            );
        });
        logger.log(data);

    }).catch((err: any) => {
        logger.error({err});

        error = {
            present: true,
            code: 500,
            error: ERROR_CODES.get(500),
            details: ERROR_MESSAGE(500, JSON.stringify(err))
        };
        
    });

    return wrapResponse(error, data);
};


export async function createPlaylist(playlist_name: string, logger: Verbal): Promise<GeneralResponse> {
    let error: ErrorResponse = {
        present: false
    };
    let data: any = {};

    async function save(data: any) {

        await jsonfile.writeFile(
            "../../public/applemusic.json",
            data,
            {
                encoding: "utf-8",
                spaces: 4
            }
        ).catch((err: any) => {
            logger.error({err});

            error = {
                present: true,
                code: 500,
                error: ERROR_CODES.get(500),
                details: err
            }

        });

    };

    await jsonfile.readFile(
        "../../public/applemusic.json",
        {
            encoding: "utf-8"
        }
    ).catch((err: any) => {
        logger.error({err});

        error = {
            present: true,
            code: 500,
            error: ERROR_CODES.get(500),
            details: err
        };

    }).then((apple_music_res: any[]) => {

        apple_music_res.push({
            name: playlist_name,
            songs: [],
            length: 0
        });

        return apple_music_res;
    }).then(async (updated_playlists: any[]) => {

        await save(updated_playlists);

    }).catch((err: any) => {
        logger.error({err});

        error = {
            present: true,
            code: 500,
            error: ERROR_CODES.get(500),
            details: err
        };
    })

    return wrapResponse(error, data);
};