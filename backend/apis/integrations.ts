import { MongoClient, Db, Collection, WithId, Document } from "mongodb";
import {v4} from "uuid";
import { AxiosInstance } from "axios";

//_ LOCAL
import { MONGODB_CLIENT, SPOTIFY_ACCOUNTS_INSTANCE, SPOTIFY_API_INSTANCE } from "./clients.js";

import { getAppleMusicPlaylist } from "./media/applemusic.js";
import { createPlaylist, refreshToken } from "./media/spotify.js";

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
export async function transferMusic(full: boolean, source: string, destination: string, session_id: string, items?: string[]): Promise<GeneralResponse> {
    let error: ErrorResponse = {
        present: false,
    };
    let data: any[] = [];
    let source_data: any, query_filter: any = {"_id": session_id};
    const SESSION_DATA: WithId<Document> | null = await USER_SESSIONS_COLLECTION.findOne(query_filter);

    if (!SESSION_DATA) { //* invalid session ID, failed to get session

        error = {
            present: true,
            code: 500,
            error: ERROR_CODES.get(500),
            details: ERROR_MESSAGE(500, "can't find session")
        }

        return wrapResponse(error, data);
    };

    //_ GET
    async function get() {

        switch (source.toLowerCase().replaceAll(" ", "")) {

            case ("spotify"): {

                break;   
            };

            case ("applemusic"): {

                await getAppleMusicPlaylist(
                    INTEGRATIONS_LOGGER,
                    full,
                    items
                ).then((apple_music_res: GeneralResponse) => {
                    INTEGRATIONS_LOGGER.log({apple_music_res});

                    if (apple_music_res.error.present) error = apple_music_res.error;

                    source_data = apple_music_res.data;

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
                    details: ""
                }
            };
        };

    };

    //_ PUT
    async function put() {

        switch (destination.toLowerCase().replaceAll(" ", "")) {

            case ("spotify"): { //* tidy this up
                //TODO: consider some sort of function to check & update tokens automatically...and save and hold this in prod
                //_ SPOTIFY TOOLS
                let spotify_tokens = SESSION_DATA!.session.spotify;
                //_ DATE
                const NOW = new Date().getTime();
                INTEGRATIONS_LOGGER.log({NOW});

                if (NOW > spotify_tokens.expiryTime - 10000) { //* tokens expired (or within 10secs of expiry)

                    await refreshToken(
                        spotify_tokens.refreshToken,
                        SPOTIFY_ACCOUNTS_INSTANCE(process.env.SPOTIFY_CLIENT_ID, process.env.SPOTIFY_CLIENT_SECRET),
                        INTEGRATIONS_LOGGER
                    ).then(async (token_res: GeneralResponse) => {
                        INTEGRATIONS_LOGGER.log({token_res});

                        if (token_res.error.present) throw new Error(JSON.stringify(token_res.error));

                        spotify_tokens = {
                            ...spotify_tokens,
                            accessToken: token_res.data.access_token,
                            scope: token_res.data.scope,
                            expiryTime: (token_res.data.expires_in * 1000) + Date.now(),
                            tokenType: token_res.data.token_type
                        };

                        const UPDATE_TOKENS_RES = await USER_SESSIONS_COLLECTION.updateOne(
                            query_filter,
                            { 
                                $set: { 
                                    session: {
                                        spotify: {
                                            refreshToken: spotify_tokens.refreshToken,
                                            accessToken: token_res.data.access_token,
                                            scope: token_res.data.scope,
                                            expiryTime: (token_res.data.expires_in * 1000) + Date.now(),
                                            tokenType: token_res.data.token_type
                                        }
                                    }
                                }
                            }, 
                            {
                                upsert: true
                            }
                        );
                        INTEGRATIONS_LOGGER.log({UPDATE_TOKENS_RES});

                    }).catch((err: any) => {
                        INTEGRATIONS_LOGGER.error({err});

                    });

                };

                source_data.forEach(async (s_d: any) => {

                    await createPlaylist(
                        SPOTIFY_API_INSTANCE(spotify_tokens.tokenType, spotify_tokens.accessToken), 
                        `${process.env.SPOTIFY_USER_ID}`, 
                        s_d, 
                        INTEGRATIONS_LOGGER
                    ).then((spotify_res: GeneralResponse) => {

                        if (spotify_res.error.present) error = spotify_res.error;

                        INTEGRATIONS_LOGGER.log(spotify_res.data);

                        data.push({
                            item: s_d,
                            response: spotify_res
                        });

                    }).catch((err: any) => {
                        INTEGRATIONS_LOGGER.error({err});

                        error = {
                            present: true,
                            code: 500,
                            error: ERROR_CODES.get(500),
                            details: ERROR_MESSAGE(500, JSON.stringify(err))
                        };

                        data.push({
                            item: s_d,
                            response: err
                        });

                    });

                });

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
                    details: ""
                }
            };
        }

    };

    //_ STORE
    async function store() {

        // if (SESSION_DATA.session.integr)

        


    };

    await get();
    await put();

    return wrapResponse(error, data);
};

//TODO: an object for getting functions for each source, & same for putting
//TODO: try to standardize everything
//TODO: consider a route & controller for mongodb