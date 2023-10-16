//_ UTILS
export type LogData = string | Record<any, any> | object | number;

export enum Framework {
    EXPRESS = "morgan",
    KOA = "koa",
    MORGAN = "morgan",
    WINSTON = "winston"
};


//_ REQUESTS
export interface IRequest {
    queryParameters: {
        playlistName?: string,
        includeSongs?: boolean
    }
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