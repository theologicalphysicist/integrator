import chalk from "chalk";


type LogData = string | Record<any, any> | object;
export const LOG_LEVELS: any = {
    DEBUG: "white",
    INFO: "cyan",
    WARN: "orange",
    WARNING: "orange",
    ERROR: "red"
}


export class Verbal {
    name?: string;
    readonly printable_types: Array<string> = ["string", "number", "undefined", "null", "bigint", "boolean"];
    readonly COLORS: Record<string, string> = {
        red: "#E88388",
        orange: "#EB8B59",
        yellow: "#DBCB79",
        cyan: "#66C2CD",
        blue: "#71BEF2",
        purple: "#D290E3",
        white: "#e7e7e7"
    };
    readonly LEVELS: Record<string, number> = {
        INFO: 4,
        DEBUG: 3,
        WARNING: 2,
        ERROR: 1,
        CRITICAL: 0,
        EVENT: -1
    };


    //_ CONSTRUCTORS
    constructor(name: string = `${process.env.npm_package_name}`) {
        this.name = name;

    };


    //_ GENERAL LOGGING FUNCTIONS
    debug(data: LogData) {
        const OUT = this.printable_types.includes(typeof data) ? data : JSON.stringify(data, null, 4);

        return console.log(`\n${chalk.bgHex(this.COLORS.white).hex("#000").bold(" DEBUG ")} - ${chalk.hex(this.COLORS.white).underline(this.name)}: ${OUT}\n`);
    };


    info(data: LogData) {
        const OUT = this.printable_types.includes(typeof data) ? data : JSON.stringify(data, null, 4);

        return console.log(`\n${chalk.bgHex(this.COLORS.cyan).hex("#000").bold(" INFO ")} - ${chalk.hex(this.COLORS.cyan).underline(this.name)}: ${OUT}\n`);
    };


    warn(data: LogData) {
        const OUT = this.printable_types.includes(typeof data) ? data : JSON.stringify(data, null, 4);

        return console.log(`\n${chalk.bgHex(this.COLORS.orange).hex("#000").bold(" WARNING ")} - ${chalk.hex(this.COLORS.orange).underline(this.name)}: ${OUT}\n`);
    };


    error(data: LogData) {
        const OUT = this.printable_types.includes(typeof data) ? data : JSON.stringify(data, null, 4);

        return console.log(`\n${chalk.bgHex(this.COLORS.red).hex("#000").bold(" ERROR ")} - ${chalk.hex(this.COLORS.red).underline(this.name)}: ${OUT}\n`);
    };

    log(data: LogData, level?: string): string | void {
        const OUT = this.printable_types.includes(typeof data) || data == null ? data : JSON.stringify(data, null, 4);
        const LOG_COLOR: string = level ? this.COLORS[LOG_LEVELS[level]] : this.COLORS.purple;

        return console.log(`\n${chalk.bgHex(LOG_COLOR).hex("#000").bold(` LOG: ${level} `)} - ${chalk.hex(LOG_COLOR).underline(this.name)}: ${OUT}\n`);
    };
    //TODO: refactor selection statements, use switch-case to be more compatible with other frameworks
    //TODO: refactor to be simpler
}