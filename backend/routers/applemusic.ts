import {Request, Response, Router, NextFunction} from "express";

//_ LOCAL
import { getAppleMusicPlaylist } from "../apis/media/applemusic.js";

import { Verbal } from "../utils/logger.js";
import { ERROR_MESSAGE } from "../utils/error.js";
import { GeneralResponse, IRequest } from "../utils/types.js";
import { checkEnvironment } from "../utils/func.js";


export const APPLE_MUSIC_ROUTER: Router = Router();
const APPLE_MUSIC_LOGGER = new Verbal("🎼apple music🎼");


//_ MIDDLEWARE
APPLE_MUSIC_ROUTER.use((req: Request & Partial<IRequest>, res: Response, next: NextFunction) => {
    APPLE_MUSIC_LOGGER.info("request for apple music came in!");

    req.queryParameters = {
        ...req.queryParameters
    }

    next();
});


APPLE_MUSIC_ROUTER.use("/resource", (req: Request & Partial<IRequest>, res: Response, next: NextFunction) => {

    if (req.query.playlistName) {req.queryParameters!.playlistName = `${req.query.playlistName}`};
    if (req.query.includeSongs) {req.queryParameters!.includeSongs = ["t", "true"].includes(`${req.query.includeSongs}`.toLowerCase())};

    next();
});


//_ ROUTES
APPLE_MUSIC_ROUTER.get("/resource/playlist", async (req: Request & Partial<IRequest>, res: Response, next: NextFunction) => {

    if (!req.queryParameters?.playlistName) next(ERROR_MESSAGE(400, "no playlist name provided."));

    await getAppleMusicPlaylist(
        APPLE_MUSIC_LOGGER,
        req.queryParameters?.includeSongs!, //* request only names of playlists or full details
        [req.queryParameters?.playlistName!]
    ).then((apple_music_res: GeneralResponse) => {
        
        if (checkEnvironment()) APPLE_MUSIC_LOGGER.info(apple_music_res);

        if (apple_music_res.error.present) next(ERROR_MESSAGE(apple_music_res.error.code, apple_music_res.error.details))

        res.status(200).send(apple_music_res.data);
    }).catch((apple_music_err: any) => {

        if (checkEnvironment()) APPLE_MUSIC_LOGGER.error(apple_music_err);

        next(apple_music_err);
    });
        
});