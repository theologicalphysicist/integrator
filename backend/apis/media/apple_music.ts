import playlists from "../../public/apple_music.js";
import { ErrorResponse, GeneralResponse } from "../../utils/types.js";
import { wrapResponse } from "../../utils/func.js";


//_ PLAYLISTS
export async function getPlaylist(playlist_name: string): Promise<GeneralResponse> {
    let error: ErrorResponse = {
        present: false,
    }
    let data: any = {}

    // @ts-ignore
    data = playlists[playlist_name];

    return wrapResponse(error, data);
};


export async function createPlaylist(playlist_name: string): Promise<null | undefined | void> {

    let error: ErrorResponse = {
        present: false
    };
    let data: any = {};

    

};