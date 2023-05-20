import chalk from "chalk";

export const RequestLoggerFormat = (tokens, req, res) => {
    return `\n${chalk.bgHex("#EF596F").bold(" REQ ")} \n${chalk.bold(tokens.method(req, res))} ${chalk.underline(req.path)}, date:${chalk.italic(tokens.date(req, res, "web"))} \nquery: ${chalk.hex("#EF596F33")(JSON.stringify(req.query, null, 2))} \nbody: ${chalk.hex("#EF596F")(JSON.stringify(req.body, null, 2))} \nparams: ${chalk.hex("#EF596F")(JSON.stringify(req.params, null, 2))}\n`;
};


export const ResponseLoggerFormat = (tokens, req, res) => {
    return `\n${chalk.bgHex("#61AFEF").bold(" RES ")} \nstatus:${chalk.hex("#61AFEF").bold(tokens.status(req, res))}, response time:${chalk.bold(tokens["total-time"](req, res, 1) + "ms")}\n`;
};