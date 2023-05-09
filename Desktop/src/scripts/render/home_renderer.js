import {IntroductionParagraph, IntegrationSection} from "../components/home.js";
import {Title, NAVIGATION_BAR, Navbar} from "./global_renderer.js";


const TITLE_AREA = document.getElementById("main_title");
const INTRO_AREA = document.getElementById("intro_area");
const PRODUCTIVITY_SELECTION_TITLE = document.getElementById("productivity_selection_title");
const PRODUCTIVITY_SELECTION_AREA = document.getElementById("productivity_selection_area");
const MEDIA_SELECTION_TITLE = document.getElementById("media_selection_title");
const MEDIA_SELECTION_AREA = document.getElementById("media_selection_area");
const EXIT_BUTTON = document.getElementById("exit_app");


renderer.LeaveApp((event) => {
    localStorage.clear();
});


const DataFetchFunctions = () => {
    const NOTION_FETCH_COMMAND = document.getElementById("notion_fetch");
    NOTION_FETCH_COMMAND.onclick = async (event) => {
        console.log(event);
        const NOTION_DATABASE_RES = await renderer.fetch(
            `/notion`,
            null,
            localStorage.getItem("sessionID"),
            JSON.parse(localStorage.getItem("cookies")),
            "GET"
        );

        localStorage.setItem("recentFetch", "NOTION");
        localStorage.setItem("NotionFetchData", JSON.stringify(NOTION_DATABASE_RES.data));
        location.href = "../pages/data.html";
    };

    const SPOTIFY_FETCH_COMMAND = document.getElementById("spotify_fetch");
    SPOTIFY_FETCH_COMMAND.onclick = async (event) => {
        const AUTH_URL = await renderer.fetch(
            `/spotify/authorization`,
            null,
            localStorage.getItem("sessionID"),
            JSON.parse(localStorage.getItem("cookies")),
            "GET"
        );

        console.log(AUTH_URL);

        localStorage.setItem("recentFetch", "SPOTIFY");
        renderer.SpotifyAuth(AUTH_URL.data, localStorage.getItem("sessionID"));
    };

    const GITHUB_FETCH_COMMAND = document.getElementById("github_fetch");
    GITHUB_FETCH_COMMAND.onclick = async (event) => {
        console.log(event);
        const RES = await (await fetch(`${renderer.EXPRESS_BACKEND_API_URL}/github_repositories?username=${renderer.GITHUB_USERNAME}`)).json();
        console.log(RES);
        localStorage.setItem("recentFetch", "GITHUB");
        localStorage.setItem("GithubFetchData", JSON.stringify(RES));
        location.href = "../pages/data.html";
    };
};


const HomePageRender = async () => {
    renderer.fetch("/init", null, null, null, "GET")
        .then((res) => {
            console.log(res);
            localStorage.setItem("sessionID", res.data.id);
            localStorage.setItem("cookies", JSON.stringify(res.data.cookies));
        })
        .catch((err) => {
            console.error(`ERROR: ${err}`);
        });
    
    NAVIGATION_BAR.innerHTML += Navbar({
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
            ${IntegrationSection({
                sectionID: "focus_section",
                appName: "Focus Todo",
                appImage: "focus-logo.jpeg",
                buttonID: "focus_fetch"
            }) + IntegrationSection({
                sectionID: "pomotodo_section",
                appName: "Pomotodo",
                appImage: "pomotodo-logo.jpeg",
                buttonID: "pomotodo_fetch"
            })}
        </div>
        <div class="integration-row">
            ${IntegrationSection({
                sectionID: "todo_section",
                appName: "Microsoft Todo",
                appImage: "todo-logo.png",
                buttonID: "todo_fetch"
            }) + IntegrationSection({
                sectionID: "github_section",
                appName: "Github",
                appImage: "github-logo.png",
                buttonID: "github_fetch"
            })}
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
                appName: "iTunes",
                appImage: "itunes-logo.png",
                buttonID: "itunes_fetch"
            })}
        </div>
    `;

    EXIT_BUTTON.onclick = async (event) => {
        const END_SESSION_RES = await fetch(`${renderer.EXPRESS_BACKEND_API_URL}/exit?sessionID=${localStorage.getItem("sessionID")}`);
        localStorage.clear();
        
        //TODO EXCEPTION HANDLING HERE!
    };

    DataFetchFunctions();
};


await HomePageRender();