import { Router } from "express";

export const router = Router();


router.use((req, res, next) => {
    if (!req.query.sessionID) {
        next(new Error("No session id given!"));
    };
    
    req.sessionStore.get(req.query.sessionID, (err, sess) => {
        if (!sess) next(new Error("Invalid session id!"));
    });
});