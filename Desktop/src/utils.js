const sass = require("sass");
const fs = require("fs");
const path = require("path");

const loadCssPreprocessors = () => {
    const home_res = sass.compile(path.join(__dirname, "/styles/scss/home/home.scss"));    
    fs.writeFile(
        path.join(__dirname, "/styles/home.css"), 
        home_res.css, 
        (err) => {
            if (err) {console.log(err)}
        }
    );

    const productivity_res = sass.compile(path.join(__dirname, "/styles/scss/data/data.scss"));
    fs.writeFile(
        path.join(__dirname, "/styles/data.css"), 
        productivity_res.css, 
        (err) => {
            if (err) {console.log(err)}
        }
    );

    const media_res = sass.compile(path.join(__dirname, "/styles/scss/media/media.scss"));
    fs.writeFile(
        path.join(__dirname, "/styles/media.css"), 
        media_res.css, 
        (err) => {
            if (err) {console.log(err)}
        }
    );
};

module.exports = {loadCssPreprocessors};