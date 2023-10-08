import {writeFile} from "node:fs/promises";

import csv from "csvtojson";

//_ LOCAL
import { ERROR_CODES } from "./error.js";
import { Verbal } from "./logger.js";


//_LOGGER
const FUNCS_LOGGER = new Verbal("utility functions");


//_ FUNCTIONS
export function generateRandomString(length) {
    //TODO: ENSURE ONLY UNIQUE VALUES GENERATED
    const POSSIBLE = "abcdef0123456789";
    let text = '';
  
    for (let i = 0; i < length; i++) {
        text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
    };

    return text;
};


export function wrapResponse(error, res_data) {
    
    return {
        error: {...error},
        data: res_data
    };
};


export function formatAxiosError(error_obj) {
    const REQUEST_CONFIG = {
        url: error_obj.config.baseURL + error_obj.config.url,
        responseType: error_obj.config.responseType.toUpperCase(),
        method: error_obj.config.method.toUpperCase(),
        params: error_obj.config.params
    };

    //TODO: FIND WAY TO GET ERROR NAME BASED ON STATUS CODE
    if (error_obj.response) {
        console.log("ERROR TYPE: response");

        return {
            code: error_obj.response.status,
            error: ERROR_CODES.get(error_obj.response.status),
            details: `${JSON.stringify({message: error_obj.response.data.error.message.toLowerCase(), ...REQUEST_CONFIG})}`
        };
    } else if (error_obj.request) {
        console.log("ERROR TYPE: request");

        return {
            code: 500,
            error: ERROR_CODES.get(500),
            details: `${JSON.stringify({...error_obj.request, ...REQUEST_CONFIG})}`
        };
    } else {
        console.log("ERROR TYPE: unknown");

        return {
            code: error_obj.status,
            error: ERROR_CODES.get(error_obj.status),
            details: `${JSON.stringify({name: error_obj.name, message: error_obj.message, ...REQUEST_CONFIG})}`
        };
    }

};


export function checkEnvironment() { //* check if not in some form of production environment

    return !["production", "prod", "development", "dev"].includes(process.env.NODE_ENV);
};


export async function CSVtoJSON(in_path, out_path) {
    let formatted_playlists;
    const APPLE_MUSIC_CONTENTS = await csv().fromFile(in_path, {autoClose: true});

    APPLE_MUSIC_CONTENTS.forEach((song, index) => {

        if (!formatted_playlists[`${song["Playlist name"]}`]) formatted_playlists[`${song["Playlist name"]}`] = [];
        
        formatted_playlists[`${song["Playlist name"]}`].push({
            name: song["Track name"],
            artist: song["Artist name"],
            album: song["Album"],
            ISRC: parseInt(song["ISRC"])
        });
    });

    await writeFile(
        out_path, 
        JSON.stringify(formatted_playlists, null, 4)
    ).catch((err) => {
        FUNCS_LOGGER.error({err});
    });

};


export async function JSONifyCSV(in_path, out_path) {
    const APPLE_MUSIC_CONTENTS = await csv().fromFile(in_path, {autoClose: true});
    let playlists = [{}];

    APPLE_MUSIC_CONTENTS.forEach((song, song_index) => {

    
    });

};