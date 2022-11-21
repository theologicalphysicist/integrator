import { NAVIGATION_BAR, NAV_IMAGE, Navbar } from "./global_renderer.js";
import {ProductivitySection} from "../components/productivity.js";
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

    LOAD_DATA_AREA.innerHTML = 
    `
        <div class="productivity-row">
            ${ProductivitySection(
                {
                    sectionID: "notion_section",
                    appName: "Notion",
                    appImage: "notion-logo.png",
                    buttonID: "notion_fetch"
                }
            ) + ProductivitySection(
                {
                    sectionID: "pomodone_section",
                    appName: "Pomodone",
                    appImage: "pomodone-logo.png",
                    buttonID: "pomodone_fetch"
                }
            )}
        </div>
        <div class="productivity-row">
            ${ProductivitySection(
                {
                    sectionID: "focus_section",
                    appName: "Focus Todo",
                    appImage: "focus-logo.jpeg",
                    buttonID: "focus_fetch"
                }
            )+ ProductivitySection(
                {
                    sectionID: "pomotodo_section",
                    appName: "Pomotodo",
                    appImage: "pomotodo-logo.jpeg",
                    buttonID: "pomotodo_fetch"
                }
            )}
        </div>
        <div class="productivity-row">
            ${ProductivitySection(
                {
                    sectionID: "todo_section",
                    appName: "Microsoft Todo",
                    appImage: "todo-logo.png",
                    buttonID: "todo_fetch"
                }
            )}
        </div>
    `

    const NOTION_FETCH_COMMAND = document.getElementById("notion_fetch");
    NOTION_FETCH_COMMAND.onclick = async (event) => {
        console.log(event);
        const res = await fetch(`${renderer.EXPRESS_BACKEND_API_URL}/notion_uni_db`)
        .then((response) => response.json())
        .then((data) => console.log(data));
        console.log(res);
    }

    const POMODONE_FETCH_COMMAND = document.getElementById("pomodone_fetch");
    POMODONE_FETCH_COMMAND.onclick = async (event) => {
        console.log(event);
    }

}

pinger();
ProductivityPageRender();