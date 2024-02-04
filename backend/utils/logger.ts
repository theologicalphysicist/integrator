import { Request, Response } from "express";
import {TokenIndexer} from "morgan";
import chalk from "chalk";

import { Framework, LogData } from "./types.js";


export class Verbal {
    //_ PROPERTIES
    name: string;
    print: boolean;
    framework?: Framework;
    readonly SERVER_COLORS: Record<string, string> = {
        red: "#E88388",
        orange: "#EB8B59",
        yellow: "#DBCB79",
        cyan: "#66C2CD",
        blue: "#71BEF2",
        purple: "#D290E3",
        white: "#e7e7e7",
        request: "#EF596F",
        response: "#61AFEF"
    };
    readonly levels: Record<string, number> = {
        INFO: 4,
        DEBUG: 3,
        WARNING: 2,
        ERROR: 1,
        CRITICAL: 0
    };

    //_ CONSTRUCTORS
    constructor(name=process.env.npm_package_name ?? "integrator-backend", print: boolean = true, framework?: Framework) {
        this.name = name;
        this.print = print;
        this.framework = framework;
    };

    //_ GENERAL LOGGING FUNCTIONS
    debug(data: LogData): string | void {
        const OUT_DATA = ["string", "number", "undefined"].includes(typeof data) || data == null  ? data : `\n${JSON.stringify(data, null, 2)}`;

        if (!this.print) return `\n${chalk.bgHex(this.SERVER_COLORS.white).hex("#000").bold(" DEBUG ")} - ${chalk.hex(this.SERVER_COLORS.white).underline(this.name + ":")} ${OUT_DATA}\n` 

        return console.log(`\n${chalk.bgHex(this.SERVER_COLORS.white).hex("#000").bold(" DEBUG ")} - ${chalk.hex(this.SERVER_COLORS.white).underline(this.name + ":")} ${OUT_DATA}\n`);
    };


    info(data: LogData): string | void {
        const OUT_DATA = ["string", "number", "undefined"].includes(typeof data) || data == null  ? data : `\n${JSON.stringify(data, null, 2)}`;

        if (!this.print) return `\n${chalk.bgHex(this.SERVER_COLORS.cyan).hex("#000").bold(" INFO ")} - ${chalk.hex(this.SERVER_COLORS.cyan).underline(this.name + ":")} ${OUT_DATA}\n` 

        return console.log(`\n${chalk.bgHex(this.SERVER_COLORS.cyan).hex("#000").bold(" INFO ")} - ${chalk.hex(this.SERVER_COLORS.cyan).underline(this.name + ":")} ${OUT_DATA}\n`);
    };


    warn(data: LogData): string | void {
        const OUT_DATA = ["string", "number", "undefined"].includes(typeof data) || data == null  ? data : `\n${JSON.stringify(data, null, 2)}`;

        if (!this.print) return `\n${chalk.bgHex(this.SERVER_COLORS.orange).hex("#000").bold(" WARNING ")} - ${chalk.hex(this.SERVER_COLORS.orange).underline(this.name + ":")} ${OUT_DATA}\n` 

        return console.log(`\n${chalk.bgHex(this.SERVER_COLORS.orange).hex("#000").bold(" WARNING ")} - ${chalk.hex(this.SERVER_COLORS.orange).underline(this.name + ":")} ${OUT_DATA}\n`);
    };


    error(data: LogData): string | void {
        const OUT_DATA = ["string", "number", "undefined"].includes(typeof data) || data == null ? data : `\n${JSON.stringify(data, null, 2)}`;

        if (!this.print) return `\n${chalk.bgHex(this.SERVER_COLORS.red).hex("#000").bold(" ERROR ")} - ${chalk.hex(this.SERVER_COLORS.red).underline(this.name + ":")} ${OUT_DATA}\n` 

        return console.log(`\n${chalk.bgHex(this.SERVER_COLORS.red).hex("#000").bold(" ERROR ")} - ${chalk.hex(this.SERVER_COLORS.red).underline(this.name + ":")} ${OUT_DATA}\n`);
    };


    log(data: LogData): string | void {
        const OUT_DATA = ["string", "number", "undefined"].includes(typeof data) || data == null ? data : `\n${JSON.stringify(data, null, 2)}`;

        if (!this.print) return `\n${chalk.bgHex(this.SERVER_COLORS.purple).hex("#000").bold(" LOG ")} - ${chalk.hex(this.SERVER_COLORS.purple).underline(this.name + ":")} ${OUT_DATA}\n` 

        return console.log(`\n${chalk.bgHex(this.SERVER_COLORS.purple).hex("#000").bold(" LOG ")} - ${chalk.hex(this.SERVER_COLORS.purple).underline(this.name + ":")} ${OUT_DATA}\n`);
    };

    //_ BACKEND LOGGING FUNCTIONS
    request(tokens: TokenIndexer, req: Request, res: Response): string | null {

        return `\n${chalk.bgHex("#EF596F").bold(" REQ ")} \n${chalk.bold(tokens.method(req, res))} ${chalk.underline(req.path)}, date:${chalk.italic(tokens.date(req, res, "web"))} \nquery: ${chalk.hex("#EF596F33")(JSON.stringify(req.query, null, 2))} \nbody: ${chalk.hex("#EF596F")(JSON.stringify(req.body, null, 2))} \nparams: ${chalk.hex("#EF596F")(JSON.stringify(req.params, null, 2))}\n`;
    };


    response(tokens: TokenIndexer, req: Request, res: Response): string | null {

        return `\n${chalk.bgHex("#61AFEF").bold(" RES ")} \nstatus:${chalk.hex("#61AFEF").bold(tokens.status(req, res))}, response time:${chalk.bold(tokens["total-time"](req, res, 1) + "ms")}\n`;
    };

};

//TODO: logging => file
//TODO: reformatting for general logging