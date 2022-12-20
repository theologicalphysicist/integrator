import { NAVIGATION_BAR, Navbar } from "./global_renderer.js";
import {NotionDBGrid} from "../components/data.js";

const LOAD_DATA_AREA = document.getElementById("load_data");

const DataPageRender = () => {
    NAVIGATION_BAR.innerHTML += Navbar({
        current: "Data Page",
        links: {
            Home: "../pages/index.html",
            data: "../pages/data.html",
            Media: "../pages/media.html"
        }
    });
    // TITLE.innerHTML = Title(`${"NOTION"} DATA`);
    const FETCHED = JSON.parse(localStorage.getItem("NotionFetchData"));
    if (FETCHED) LOAD_DATA_AREA.innerHTML = NotionDBGrid(FETCHED);
}

DataPageRender();