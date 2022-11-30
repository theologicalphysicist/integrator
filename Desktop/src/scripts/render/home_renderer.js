import {IntroductionParagraph, IntegrationSection} from "../components/home.js";
import {Title, NAVIGATION_BAR, NAV_IMAGE, Navbar } from "./global_renderer.js";

const TITLE_AREA = document.getElementById("main_title");
const INTRO_AREA = document.getElementById("intro_area");
const PRODUCTIVITY_SELECTION_TITLE = document.getElementById("productivity_selection_title");
const PRODUCTIVITY_SELECTION_AREA = document.getElementById("productivity_selection_area");
const MEDIA_SELECTION_TITLE = document.getElementById("media_selection_title");
const MEDIA_SELECTION_AREA = document.getElementById("media_selection_area");

const DataFetchFunctions = () => {
    const NOTION_FETCH_COMMAND = document.getElementById("notion_fetch");
    NOTION_FETCH_COMMAND.onclick = async (event) => {
        console.log(event);
        const res = await fetch(`${renderer.EXPRESS_BACKEND_API_URL}/notion_uni_database`)
        .then((response) => response.json())
        .then((data) => console.log(data));
        console.log(res);
    }

    const SPOTIFY_FETCH_COMMAND = document.getElementById("spotify_fetch");
    SPOTIFY_FETCH_COMMAND.onclick = async (event) => {
        console.log(event);
        const res = await fetch(`${renderer.EXPRESS_BACKEND_API_URL}/spotify`)
        .then((response) => response.json())
        .then((data) => console.log(data));
        console.log(res);
    }


    // const POMODONE_FETCH_COMMAND = document.getElementById("pomodone_fetch");
    // POMODONE_FETCH_COMMAND.onclick = async (event) => {
    //     console.log(event);
    // }
} 

// const pinger = async () => {
//     const res = await renderer.bing();
//     console.log(res);
// }

const HomePageRender = () => {    
    NAVIGATION_BAR.innerHTML = NAV_IMAGE + Navbar({
        current: "Home",
        links: {
            Home: "../pages/index.html",
            Data: "../pages/data.html",
            Media: "../pages/media.html",
        }
    });

    TITLE_AREA.innerHTML = Title("Integrator");
    INTRO_AREA.innerHTML = IntroductionParagraph();
    PRODUCTIVITY_SELECTION_TITLE.innerHTML = `
        <h2>Productivity Integrations</h2>
    `;
    PRODUCTIVITY_SELECTION_AREA.innerHTML = `
        <div class="integration-row">
            ${IntegrationSection(
                {
                    sectionID: "notion_section",
                    appName: "Notion",
                    appImage: "notion-logo.png",
                    buttonID: "notion_fetch"
                }
            ) + IntegrationSection(
                {
                    sectionID: "pomodone_section",
                    appName: "Pomodone",
                    appImage: "pomodone-logo.png",
                    buttonID: "pomodone_fetch"
                }
            )}
        </div>
        <div class="integration-row">
            ${IntegrationSection(
                {
                    sectionID: "focus_section",
                    appName: "Focus Todo",
                    appImage: "focus-logo.jpeg",
                    buttonID: "focus_fetch"
                }
            )+ IntegrationSection(
                {
                    sectionID: "pomotodo_section",
                    appName: "Pomotodo",
                    appImage: "pomotodo-logo.jpeg",
                    buttonID: "pomotodo_fetch"
                }
            )}
        </div>
        <div class="integration-row">
            ${IntegrationSection(
                {
                    sectionID: "todo_section",
                    appName: "Microsoft Todo",
                    appImage: "todo-logo.png",
                    buttonID: "todo_fetch"
                }
            )}
        </div>
    `;
    MEDIA_SELECTION_TITLE.innerHTML = `
        <h2>Media Integrations</h2>
    `;
    MEDIA_SELECTION_AREA.innerHTML = `
        <div class="integration-row">
            ${IntegrationSection({
                sectionID: "spotify_section",
                appName: "Spotify",
                appImage: "spotify-logo.png",
                buttonID: "spotify_fetch"
            })}
            ${IntegrationSection({
                sectionID: "itunes_section",
                appName: "itunes",
                appImage: "itunes-logo.png",
                buttonID: "itunes_fetch"
            })}
        </div>
    `;
    DataFetchFunctions();
}

// pinger();
HomePageRender();

// const mainWindowLoad = () => {

// }