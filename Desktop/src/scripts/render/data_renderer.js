import { Title, NAVIGATION_BAR, Navbar } from "./global_renderer.js";
import {DataTable} from "../components/data.js";

const LOAD_DATA_AREA = document.getElementById("load_data");
const TITLE = document.getElementById("main_title");

const DataPageRender = () => {
    NAVIGATION_BAR.innerHTML += Navbar({
        current: "Data Page",
        links: {
            Home: "../pages/index.html",
            data: "../pages/data.html",
            Media: "../pages/media.html"
        }
    });
    TITLE.innerHTML = Title(`${"NOTION"} DATA`);
    const FETCHED = JSON.parse(localStorage.getItem("data_fetched"));
    // console.log(FETCHED);
    if (FETCHED) LOAD_DATA_AREA.innerHTML = DataTable("notion_table", "data-row", FETCHED);
}

DataPageRender();