import { Model, Document } from "mongoose";

//_ UTILS
export type LogData = string | Record<any, any> | object | number;

export enum Framework {
    EXPRESS = "morgan",
    KOA = "koa",
    MORGAN = "morgan",
    WINSTON = "winston"
};

export const Sources: Array<string> = ["spotify", "applemusic", "notion", "to-do", "github"];

export enum TransferType {
    MUSIC = "music",
    PRODUCTIVITY = "productivity"
};

export interface IntegrationParameters {
    source: string,
    destination: string,
    session: any,
    sessionID: string,
    items?: string[],
    integrationID?: string | null,
    full_transfer: boolean
};


//_ REQUESTS
export interface IRequest {
    queryParameters: {
        playlistName?: string,
        includeSongs?: boolean,
        integrations: {
            type?: TransferType,
            source?: string,
            destination?: string,
            transfer: {
                fullTransfer?: boolean,
                items?: string[],
                sessionID?: string
            }
        }
    },
    currentSession: any,
    currentCookies: any
};


//_ RESPONSES & ERRORS
export interface ErrorResponse {
    present: boolean,
    code?: number,
    error?: string,
    details?: any,
    time?: Date | number | string
};

export interface GeneralResponse {
    error: ErrorResponse,
    data: any
};


//_ MEDIA
export interface PlaylistParameters {
    limit: number,
    offset?: number | string
};

export interface Playlist {
    imageURL?: string,
    name: string,
    ownerName?: string,
    length: number,
    type?: string,
    songs?: Song[]
};

export interface Song {
    name: string,
    artist: string,
    album: string,
    ISRC: number | null
};


//_ DATABASE
export interface IIntegration extends Document {
    _id: string,
    sessionID: string,
    source: string,
    destination: string,
    lastSync: number,
    data: {}
};

export interface ISession extends Document {
    _id: string,
    expires: Date | string | number,
    session: {
        spotify: {
            refreshToken: string,
            accessToken: string,
            scope: string,
            expiryTime: number,
            tokenType: string
        }
    }
};

export interface ReadQuery {
    query: Partial<IIntegration>,
    model: Model<IIntegration>,
    queryID?: string,
};

export interface ModifierQuery {
    document: Partial<IIntegration>,
    model: Model<IIntegration>,
    documentID?: string
};

export interface DatabaseResponse {
    document?: IIntegration,
    result: boolean,
    message?: string
};

//TODO: look into ways to standardize how I create types