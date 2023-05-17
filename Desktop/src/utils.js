const sass = require("sass");
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;


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


const INTEGRATOR_INSTANCE = () => {
    return axios.create({baseURL: process.env.EXPRESS_BACKEND_API_URL})
};


module.exports = {loadCSS, INTEGRATOR_INSTANCE};