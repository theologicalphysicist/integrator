import { NAVIGATION_BAR, NAV_IMAGE, Navbar } from "./global_renderer.js";
import {} from "../components/data.js";
// import info from "../../../public/info.jsonc";

const LOAD_DATA_AREA = document.getElementById("load_data");

const pinger = async () => {
    const res = await renderer.bing();
    console.log(res);
}

const DataPageRender = () => {
    NAVIGATION_BAR.innerHTML = NAV_IMAGE + Navbar({
        current: "Data Page",
        links: {
            Home: "../pages/index.html",
            data: "../pages/data.html",
            Media: "../pages/media.html"
        }
    });
}

pinger();
DataPageRender();