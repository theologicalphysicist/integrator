import Express, {Request, Response, Router, NextFunction} from "express";

//_ LOCAL
import { Verbal } from "../utils/logger.js";
import { ERROR_MESSAGE } from "../utils/error.js";
import { GeneralResponse, IRequest } from "../utils/types.js";
import { checkEnvironment } from "../utils/func.js";


const INTEGRATIONS_ROUTER: Router = Router();