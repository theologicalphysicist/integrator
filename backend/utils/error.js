//_ MIDDLEWARE
export const GENERIC_ERROR_MESSAGE = {
    statusCode: 500,
    error: "INTERNAL SERVER ERROR",
    details: "an unknown error has occurred. if this persists, report to https://github.com/theologicalphysicist/integrator/issues with the 'bug' tag",
    time: new Date()
}; //* default error details