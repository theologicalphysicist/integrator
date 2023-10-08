import chalk from "chalk";
import {TokenIndexer} from "morgan";
import { Request, Response } from "express";

import { LogData } from "./types.js";


//TODO: UPDATE LOGGER


//_ BACKEND LOGGING FUNCTIONS (MORGAN)
export const RequestLog = (tokens: TokenIndexer, req: Request, res: Response) => {
    return `\n${chalk.bgHex("#EF596F").bold(" REQ ")} \n${chalk.bold(tokens.method(req, res))} ${chalk.underline(req.path)}, date:${chalk.italic(tokens.date(req, res, "web"))} \nquery: ${chalk.hex("#EF596F33")(JSON.stringify(req.query, null, 2))} \nbody: ${chalk.hex("#EF596F")(JSON.stringify(req.body, null, 2))} \nparams: ${chalk.hex("#EF596F")(JSON.stringify(req.params, null, 2))}\n`;
};


export const ResponseLog = (tokens: TokenIndexer, req: Request, res: Response) => {
    return `\n${chalk.bgHex("#61AFEF").bold(" RES ")} \nstatus:${chalk.hex("#61AFEF").bold(tokens.status(req, res))}, response time:${chalk.bold(tokens["total-time"](req, res, 1) + "ms")}\n`;
};


export class Verbal {
    name: string;
    readonly colors: Record<string, string> = {
        red: "#E88388",
        orange: "#EB8B59",
        yellow: "#DBCB79",
        cyan: "#66C2CD",
        blue: "#71BEF2",
        purple: "#D290E3",
        white: "#e7e7e7"
    };
    readonly levels: Record<string, number> = {
        INFO: 4,
        DEBUG: 3,
        WARNING: 2,
        ERROR: 1,
        CRITICAL: 0
    };

    constructor(name=process.env.npm_package_name ?? "integrator-backend") {
        this.name = name;
    };

    //_ GENERAL LOGGING FUNCTIONS
    debug(data: LogData) {
        const OUT = ["string", "number", "undefined"].includes(typeof data) || data == null  ? data : `\n${JSON.stringify(data, null, 2)}`;

        return console.log(`\n${chalk.bgHex(this.colors.white).hex("#000").bold(" DEBUG ")} - ${chalk.hex(this.colors.white).underline(this.name + ":")} ${OUT}\n`);
    };


    info(data: LogData) {
        const OUT = ["string", "number", "undefined"].includes(typeof data) || data == null  ? data : `\n${JSON.stringify(data, null, 2)}`;

        return console.log(`\n${chalk.bgHex(this.colors.cyan).hex("#000").bold(" INFO ")} - ${chalk.hex(this.colors.cyan).underline(this.name + ":")}${chalk.hex(this.colors.cyan)(":")} ${OUT}\n`);
    };


    warn(data: LogData) {
        const OUT = ["string", "number", "undefined"].includes(typeof data) || data == null  ? data : `\n${JSON.stringify(data, null, 2)}`;

        return console.log(`\n${chalk.bgHex(this.colors.orange).hex("#000").bold(" WARNING ")} - ${chalk.hex(this.colors.orange).underline(this.name + ":")} ${OUT}\n`);
    };


    error(data: LogData) {
        const OUT = ["string", "number", "undefined"].includes(typeof data) || data == null ? data : `\n${JSON.stringify(data, null, 2)}`;

        return console.log(`\n${chalk.bgHex(this.colors.red).hex("#000").bold(" ERROR ")} - ${chalk.hex(this.colors.red).underline(this.name + ":")} ${OUT}\n`);
    };
};