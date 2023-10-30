import Express, {Request, Response, Router, NextFunction} from "express";

//_ LOCAL
import { Verbal } from "../utils/logger.js";
import { ERROR_MESSAGE } from "../utils/error.js";
import { GeneralResponse, IRequest, Sources, TransferType } from "../utils/types.js";
import { checkEnvironment } from "../utils/func.js";

import { transferMusic } from "../apis/integrations.js";


const INTEGRATIONS_ROUTER: Router = Router();
const INTEGRATIONS_LOGGER: Verbal = new Verbal();


//_ MIDDLEWARE
//* every integration request should take a source & destination
//* "transfer" path. and a "create, list (?), get, update, delete paths"
INTEGRATIONS_ROUTER.use(async (req: Request & Partial<IRequest>, res: Response, next: NextFunction) => {

    if (!req.query.sessionID) {
        next({ //* invalid request, no session id
            ...ERROR_MESSAGE(400),
            details: "invalid session ID provided.",
        })
    };

    //@ts-ignore
    await req.sessionStore.get(req.query.sessionID, (err, sess) => { 
        INTEGRATIONS_LOGGER.log("HERE 2");

        if (!sess) next({ //* invalid request, bad session id
            ...ERROR_MESSAGE(400),
            details: "invalid session ID provided.",
        });

        req.currentSession = sess;
        req.currentCookies = {
            cookie: {...sess.cookie},
            id: sess.cookieID ?? null
        };

    });

    if (!["/read", "/list", "delete"].includes(req.path)) { //* paths in list do not require source & destination

        if (
            !req.query.source || 
            !req.query.destination
        ) next({ //* invalid 
            ...ERROR_MESSAGE(400),
            details: "invald request query parameters"
        });

        req.queryParameters = {
            ...req.queryParameters,
            //@ts-ignore
            source: `${req.query.source}`,
            //@ts-ignore
            destination: `${req.query.destination}`
        };

    }

    next();
    
});


INTEGRATIONS_ROUTER.use("/transfer",async (req: Request & Partial<IRequest>, res: Response, next: NextFunction) => {
    let items;

    if (!req.query.type || !req.query.items || !req.query.fullTransfer) {
        next({
            ...ERROR_MESSAGE(400),
            details: "invald request query parameters"
        });
    }

    if (typeof req.query.items == "string") {
        items = [req.query.items];
    } else {
        //@ts-ignore
        items = req.query.items.map((i) => { return i.toString(); });
    };

    req.queryParameters!.integrations = {
        ...req.queryParameters?.integrations,
        //@ts-ignore
        type: `${req.query.type}`,
        transfer: {
            items: items,
            fullTransfer: req.query.fullTransfer?.toString() == "true"
        }
    };

    next();
    
});



//_ ROUTES
INTEGRATIONS_ROUTER.post("/transfer", async (req: Request & Partial<IRequest>, res: Response, next: NextFunction) => {
    INTEGRATIONS_LOGGER.log(JSON.stringify(req.currentSession, null, 4));

    if (req.queryParameters?.integrations.type == TransferType.MUSIC) {
        INTEGRATIONS_LOGGER.log("would execute transfer here");

        // await transferMusic(
        //     `${req.queryParameters.integrations.source}`,
        //     `${req.queryParameters.integrations.destination}`,
        //     req.currentSession.sessionID,
        //     req.queryParameters.integrations.transfer.items,
        //     req.queryParameters.integrations.transfer.fullTransfer
        // ).then((integrations_res: GeneralResponse) => {

        //     if (checkEnvironment()) INTEGRATIONS_LOGGER.info(integrations_res);

        //     if (integrations_res.error.present) next(ERROR_MESSAGE(integrations_res.error.code, integrations_res.error.details));

        //     res.status(200).send(integrations_res.data);
        // }).catch((integrations_err: any) => {
        //     INTEGRATIONS_LOGGER.error({err: integrations_err});

        //     next(integrations_err);
        // });

    };

});

export default INTEGRATIONS_ROUTER;