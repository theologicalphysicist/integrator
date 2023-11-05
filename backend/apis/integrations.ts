import { MongoClient, Db, Collection, WithId, Document } from "mongodb";
import {v4} from "uuid";
import { AxiosInstance } from "axios";

//_ LOCAL
import { MONGODB_CLIENT, SPOTIFY_ACCOUNTS_INSTANCE, SPOTIFY_API_INSTANCE } from "./clients.js";

import { getAppleMusicPlaylist } from "./media/applemusic.js";
import { createPlaylist as createSpotifyPlaylist, refreshToken } from "./media/spotify.js";

import { ErrorResponse, GeneralResponse } from "../utils/types.js";
import { ERROR_CODES, ERROR_MESSAGE } from "../utils/error.js";
import { wrapResponse } from "../utils/func.js";
import { Verbal } from "../utils/logger.js";



//_ GLOBALS
const INTEGRATIONS_LOGGER = new Verbal("INTEGRATIONS");
const INTEGRATIONS_DB_CLIENT: MongoClient = await MONGODB_CLIENT(process.env.MONGODB_USER, process.env.MONGODB_PASSWORD);
const SESSIONS_DB: Db = INTEGRATIONS_DB_CLIENT.db("sessions");
const USER_SESSIONS_COLLECTION: Collection = SESSIONS_DB.collection("user_sessions");


//_ INTEGRATIONS
export async function createIntegration(sources: string[], destinations: string[], type: string, session_id: string) {
    let query_filter: any = {_id: session_id};
    const SESSION_DATA: WithId<Document> | null = await USER_SESSIONS_COLLECTION.findOne(query_filter);

    // USER_SESSIONS_COLLECTION.updateOne(
    //     query_filter,
    //     {
    //         $
    //     }
    // )

    v4({});

};


export async function readIntegration() {

};


export async function updateIntegration() {

};


export async function deleteIntegration() {

};


//_ TRANSFERS
export async function transferMusic(source: string, destination: string, session: any, session_id: string, items?: string[], full_transfer: boolean = false): Promise<GeneralResponse> {
    let error: ErrorResponse = {
        present: false,
    };
    let data: any[] = [];
    const QUERY_FILTER: any = {"_id": session_id};
    let source_data: any[] = [];

    async function get() {

        switch (source.toLowerCase().replaceAll(" ", "")) {

            case ("spotify"): {

                break;   
            };

            case ("applemusic"): {

                await getAppleMusicPlaylist(
                    INTEGRATIONS_LOGGER,
                    full_transfer,
                    items
                ).then((apple_music_res: GeneralResponse) => {

                    if (apple_music_res.error.present) error = apple_music_res.error;

                    source_data = apple_music_res.data;

                    INTEGRATIONS_LOGGER.log("APPLE MUSIC DATA FOUND");

                }).catch((err: any) => {
                    INTEGRATIONS_LOGGER.error({err});

                    error = {
                        present: true,
                        code: 500,
                        error: ERROR_CODES.get(500),
                        details: ERROR_MESSAGE(500, JSON.stringify(err))
                    };

                });

                break;
            };

            case ("youtubemusic"): {
                
                break;
            };

            default: {

                error = {
                    present: true,
                    code: 500,
                    error: ERROR_CODES.get(500),
                    details: "failed to get source data: invalid source passed."
                };
                INTEGRATIONS_LOGGER.error({error});

            };
        };

    };

    async function put() {

        switch (destination.toLowerCase().replaceAll(" ", "")) {

            case ("spotify"): { //* tidy this up
                //TODO: consider some sort of function to check & update tokens automatically...and save and hold this in prod (like cache)
                let spotify_tokens = session.spotify;
                //_ DATE
                const NOW = new Date().getTime();
                INTEGRATIONS_LOGGER.log({NOW});

                if (NOW > spotify_tokens.expiryTime - 10000) { //* tokens expired (or within 10secs of expiry)

                    await refreshToken(
                        spotify_tokens.refreshToken,
                        SPOTIFY_ACCOUNTS_INSTANCE(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET),
                        INTEGRATIONS_LOGGER
                    ).then(async (token_res: GeneralResponse) => {

                        if (token_res.error.present) throw new Error(JSON.stringify(token_res.error)); //! better error handling is needed here

                        spotify_tokens = {
                            ...spotify_tokens,
                            accessToken: token_res.data.access_token,
                            scope: token_res.data.scope,
                            expiryTime: (token_res.data.expires_in * 1000) + Date.now(),
                            tokenType: token_res.data.token_type
                        };
        
                        //TODO: either change this to use session store, or create a new session store
                        const UPDATE_TOKENS_RES = await USER_SESSIONS_COLLECTION.updateOne(
                            QUERY_FILTER,
                            { 
                                $set: { 
                                    session: {
                                        spotify: {...spotify_tokens}
                                    }
                                }
                            }, 
                            {
                                upsert: true
                            }
                        );
                        INTEGRATIONS_LOGGER.log({
                            message: "spotify tokens soccessfully updated", 
                            ...UPDATE_TOKENS_RES
                        });

                    }).catch((err: any) => {
                        INTEGRATIONS_LOGGER.error({err});

                        error = {
                            present: true,
                            code: 500,
                            error: ERROR_CODES.get(500),
                            details: ERROR_MESSAGE(500, "failed to refresh tokens. aborted.")
                        };

                    });

                };

                if (!error.present) { //* ie., if error hasn't occured yet

                    source_data.forEach(async (s_d: any) => { //TODO: check if playlist exists first, if so, then ignore unless transferring songs, then just merge songs.

                        await createSpotifyPlaylist(
                            SPOTIFY_API_INSTANCE(spotify_tokens.tokenType, spotify_tokens.accessToken), 
                            `${process.env.SPOTIFY_USER_ID}`, 
                            s_d, 
                            INTEGRATIONS_LOGGER
                        ).then((spotify_res: GeneralResponse) => {

                            if (spotify_res.error.present) throw new Error(JSON.stringify(spotify_res.error.details))

                            return spotify_res;
                        }).catch((err: any) => {
                            INTEGRATIONS_LOGGER.error({err});

                            error = {
                                present: true,
                                code: 500,
                                error: ERROR_CODES.get(500),
                                details: ERROR_MESSAGE(
                                    500, 
                                    typeof err == "string" ? err : JSON.stringify(err)
                                )
                            };

                            return err;
                        }).then((source_data_response: any) => {

                            data.push({
                                item: s_d,
                                response: source_data_response
                            });

                        });

                    });

                };

                break;
            };

            case ("applemusic"): {

                break
            };

            case ("youtubemusic"): {

            };

            default: {
                error = {
                    present: true,
                    code: 500,
                    error: ERROR_CODES.get(500),
                    details: "invalid destination. aborted."
                }
            };
        }

    };

    async function store() {

        // if (SESSION_DATA.session.integr)

        


    };

    await get();

    if (!error.present) {

        await put();

    };

    return wrapResponse(error, data);
};

//TODO: an object for getting functions for each source, & same for putting
//TODO: try to standardize everything
//TODO: consider a route & controller for mongodb