const sass = require("sass");
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;


//_ UI PREPROCESSING
const loadCSS = () => {
    const home_res = sass.compile(path.join(__dirname, "/styles/scss/home/home.scss"));
    const productivity_res = sass.compile(path.join(__dirname, "/styles/scss/data/data.scss"));
    const media_res = sass.compile(path.join(__dirname, "/styles/scss/media/media.scss"));

    fs.writeFile(
        path.join(__dirname, "/styles/home.css"), 
        home_res.css, 
        (err) => {if (err) console.error(err);}
    );

    fs.writeFile(
        path.join(__dirname, "/styles/data.css"), 
        productivity_res.css, 
        (err) => {if (err) console.error(err);}
    );

    fs.writeFile(
        path.join(__dirname, "/styles/media.css"), 
        media_res.css, 
        (err) => {if (err) console.error(err);}
    );
    
};


//_ BACKEND REQUESTS
const INTEGRATOR_INSTANCE = () => {
    return axios.create({baseURL: process.env.EXPRESS_BACKEND_API_URL})
};


//_ ERROR HANDLING
function formatError(event, err) {
    let response = {
        error: {
            present: false,
            code: 0,
            details: null,
            error: null
        }
    };

    if (err.response) {
        response.error = {
            present: true,
            code: err.response.status,
            error: err.response.data.error.error || err.response.data.error || err.response.statusText.toUpperCase(),
            details: err.response.data.error.details || err.response.data.details || "NO ERROR DETAILS"
        };
    } else if (err.request) {
        response.error = {
            present: true,
            code: 500,
            error: "INTERNAL SERVER ERROR",
            details: err.request
        };
    } else {
        response.error = {
            present: true,
            code: 500,
            error: "INTERNAL SERVER ERROR",
            details: err.message
        };
    }

    console.log(response.error);

    event.sender.send("fetchError", {
        ...response.error
    });

    return response;
};


module.exports = {loadCSS, INTEGRATOR_INSTANCE, formatError};