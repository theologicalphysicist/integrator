import { NAVIGATION_BAR, NAV_IMAGE, Navbar } from "./global_renderer.js";
import { NotionSection } from "../components/productivity.js";
// import info from "../../../public/info.jsonc";

const LOAD_DATA_AREA = document.getElementById("load_data");

const pinger = async () => {
    const res = await renderer.bing();
    console.log(res);
}

const ProductivityPageRender = () => {
    NAVIGATION_BAR.innerHTML = NAV_IMAGE + Navbar({
        current: "Productivity Page",
        links: {
            Home: "../pages/index.html",
            Productivity: "../pages/productivity.html",
            Media: "../pages/media.html"
        }
    });

    LOAD_DATA_AREA.innerHTML = NotionSection();

    const NOTION_FETCH_COMMAND = document.getElementById("notion_fetch");
    NOTION_FETCH_COMMAND.onclick = async (event) => {
        console.log(event);
        const res = await fetch(`${renderer.EXPRESS_BACKEND_API_URL}/notion`)
        .then((response) => response.json())
        .then((data) => console.log(data));
        console.log(res);
    }

}

pinger();
ProductivityPageRender();