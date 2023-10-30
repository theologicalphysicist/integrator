//_ UTILS
export type LogData = string | Record<any, any> | object | number;

export enum Framework {
    EXPRESS = "morgan",
    KOA = "koa",
    MORGAN = "morgan",
    WINSTON = "winston"
};

export type Sources = "spotify" | "applemusic" | "notion" | "to-do" | "github";

export enum TransferType {
    MUSIC = "music",
    PRODUCTIVITY = "productivity"
};


//_ REQUESTS
export interface IRequest {
    queryParameters: {
        playlistName?: string,
        includeSongs?: boolean,
        integrations: {
            type?: TransferType,
            source?: Sources,
            destination?: Sources,
            transfer: {
                fullTransfer?: boolean,
                items?: string[]
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
    details?: any
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