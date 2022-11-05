import {Title, IntroductionParagraph} from "../components/home.js";
import { NAVIGATION_BAR, NAV_IMAGE, Navbar } from "./global_renderer.js";
// const res = sass.compile("home.scss");

// const SELECTION_AREA = document.getElementById("selection_area");
// SELECTION_AREA.innerHTML = Selection();

// const pinger = async () => {
//     const res = await renderer.bing();
//     console.log(res);
// }

const HomePageRender = () => {
    const TITLE_AREA = document.getElementById("title_area");
    const INTRO_AREA = document.getElementById("intro_area");
    
    NAVIGATION_BAR.innerHTML = NAV_IMAGE + Navbar({
        current: "Home",
        links: {
            Home: "../pages/index.html",
            Productivity: "../pages/productivity.html",
            Media: "../pages/media.html",
        }
    });

    TITLE_AREA.innerHTML = Title();
    INTRO_AREA.innerHTML = IntroductionParagraph();

}

// pinger();
HomePageRender();

// const mainWindowLoad = () => {

// }