import {IntroductionParagraph, SourcePanel} from "../components/home.js";
import {Title, Navbar, ErrorModal, SecondHeader} from "../components/global.js";


//_ WINDOW CONTAINERS
const TITLE_AREA: HTMLElement | null = document.getElementById("main_title");
const INTRO_AREA: HTMLElement | null = document.getElementById("intro_area");
const PRODUCTIVITY_SELECTION_TITLE: HTMLElement | null = document.getElementById("productivity_selection_title");
const PRODUCTIVITY_SELECTION_AREA: HTMLElement | null = document.getElementById("productivity_selection_area");
const MEDIA_SELECTION_TITLE: HTMLElement | null = document.getElementById("media_selection_title");
const MEDIA_SELECTION_AREA: HTMLElement | null = document.getElementById("media_selection_area");
const EXIT_BUTTON: HTMLElement | null = document.getElementById("exit_app");
const MODAL_CONTAINER: HTMLElement | null = document.getElementById("modal_container");
const MAIN: HTMLElement | null = document.getElementById("main");
const NAVIGATION_BAR: HTMLElement | null = document.getElementById("navigation_area");


//_ EVENT HANDLING
//@ts-ignore
if (renderer) { //* if electron desktop instead of web frontend

    //@ts-ignore
    renderer.LeaveApp((event: any) => {

        localStorage.clear();

    });

    //@ts-ignore
    renderer.fetchError(async (event: any, error_res: any) => {

        if (MODAL_CONTAINER?.hidden) {

            MODAL_CONTAINER.innerHTML += ErrorModal(error_res);

            MODAL_CONTAINER.hidden = false;
            MODAL_CONTAINER.style.display = "flex";

            const CLOSE_ERROR_MODAL: HTMLElement | null = document.getElementById("close_modal");
            CLOSE_ERROR_MODAL!.onclick = (event: any) => {

                MODAL_CONTAINER.hidden = true;
                MODAL_CONTAINER.innerHTML = "";
                MODAL_CONTAINER.style.display = "none";

            };

        }

    });

    //@ts-ignore
    renderer.init((event: any, res: any) => {

        localStorage.clear();
        localStorage.setItem("sessionID", res.id);
        localStorage.setItem("cookies", JSON.stringify(res.cookies));

    });

};


function testModal(error_res: any) {

    if (MODAL_CONTAINER?.hidden) {
        const CLOSE_ERROR_MODAL: HTMLElement | null = document.getElementById("close_modal");

        MODAL_CONTAINER.innerHTML += ErrorModal(error_res || {
            code: 500,
            error: "INTERNAL SERVER ERROR",
            details: "mock error. ignore this."
        }); //* either display error, or test error

        MODAL_CONTAINER.hidden = false;

        CLOSE_ERROR_MODAL!.onclick = (event: any) => {

            MODAL_CONTAINER.hidden = true;
            MODAL_CONTAINER.innerHTML = "";

        };
        
    };

};


//_ PAGE RENDERING
const DataFetchFunctions = () => {
    const NOTION_FETCH_COMMAND: HTMLElement | null = document.getElementById("notion_fetch");
    const SPOTIFY_FETCH_COMMAND: HTMLElement | null  = document.getElementById("spotify_fetch");
    const GITHUB_FETCH_COMMAND: HTMLElement | null  = document.getElementById("github_fetch");

    NOTION_FETCH_COMMAND!.onclick = async (event) => {

        if (localStorage.getItem("recentFetch") != "NOTION") {
            //@ts-ignore
            const NOTION_DATABASE_RES = await renderer.fetch(
                `/notion`,
                null,
                {
                    sessionID: localStorage.getItem("sessionID"),
                    cookies: JSON.parse(`${localStorage.getItem("cookies")}`),
                },
                "GET"
            );

            localStorage.setItem("recentFetch", "NOTION");
            localStorage.setItem("NotionFetchData", JSON.stringify(NOTION_DATABASE_RES.data));
        };

        location.href = "../pages/data.html";

    };

    SPOTIFY_FETCH_COMMAND!.onclick = async (event) => {

        if (localStorage.getItem("recentFetch") != "SPOTIFY") {
            //@ts-ignore
            const AUTH_URL = await renderer.fetch(
                `/spotify/auth/spotify`,
                null,
                {
                    sessionID: localStorage.getItem("sessionID"),
                    cookies: JSON.parse(`${localStorage.getItem("cookies")}`),
                },
                "GET"
            );

            //@ts-ignore
            renderer.log({AUTH_URL})

            // localStorage.setItem("recentFetch", "SPOTIFY");
            //@ts-ignore
            renderer.SpotifyAuth(AUTH_URL.data, localStorage.getItem("sessionID"));

        } else {
            location.href = "../pages/data.html";
        };

    };

    GITHUB_FETCH_COMMAND!.onclick = async (event) => {

        if (localStorage.getItem("recentFetch") != "GITHUB") {
            //@ts-ignore
            await renderer.fetch(
                "/github/repositories",
                null,
                {
                    sessionID: localStorage.getItem("sessionID"),
                    cookies: JSON.parse(`${localStorage.getItem("cookies")}`),
                    //@ts-ignore
                    username: renderer.GITHUB_USERNAME
                },
                "GET"
            )
            .then((res: any) => {
                localStorage.setItem("recentFetch", "GITHUB");
                localStorage.setItem("GithubFetchData", JSON.stringify(res.data));

                location.href = "../pages/data.html";
            });

        } else {
            location.href = "../pages/data.html"
        };

    };

};


function renderPage() {
    
    //_ GENERAL PAGE COMPONENTS
    NAVIGATION_BAR!.innerHTML += Navbar({
        current: "Home",
        links: {
            Home: "../pages/index.html",
            Integrations: "../pages/integration.html",
            Data: "../pages/data.html"
        }
    });

    TITLE_AREA!.innerHTML = Title("Integrator");

    INTRO_AREA!.innerHTML = IntroductionParagraph();

    //_ SOURCES
    PRODUCTIVITY_SELECTION_TITLE!.innerHTML = SecondHeader("Productivity Sources");
    PRODUCTIVITY_SELECTION_AREA!.innerHTML = `
        <div class="integration-row">
            ${SourcePanel(
                {
                    sectionID: "notion_section",
                    appName: "Notion",
                    appImage: "notion-logo.png",
                    buttonID: "notion_fetch"
                }
            ) + SourcePanel(
                {
                    sectionID: "pomodone_section",
                    appName: "Pomodone",
                    appImage: "pomodone-logo.png",
                    buttonID: "pomodone_fetch"
                }
            )}
        </div>
        <div class="integration-row">
            ${SourcePanel({
                sectionID: "focus_section",
                appName: "Focus Todo",
                appImage: "focus-logo.jpeg",
                buttonID: "focus_fetch"
            }) + SourcePanel({
                sectionID: "pomotodo_section",
                appName: "Pomotodo",
                appImage: "pomotodo-logo.jpeg",
                buttonID: "pomotodo_fetch"
            })}
        </div>
        <div class="integration-row">
            ${SourcePanel({
                sectionID: "todo_section",
                appName: "Microsoft Todo",
                appImage: "todo-logo.png",
                buttonID: "todo_fetch"
            }) + SourcePanel({
                sectionID: "github_section",
                appName: "Github",
                appImage: "github-logo.png",
                buttonID: "github_fetch"
            })}
        </div>
    `;
    MEDIA_SELECTION_TITLE!.innerHTML = SecondHeader("Media Sources");
    MEDIA_SELECTION_AREA!.innerHTML = `
        <div class="integration-row">
            ${SourcePanel({
                sectionID: "spotify_section",
                appName: "Spotify",
                appImage: "spotify-logo.png",
                buttonID: "spotify_fetch"
            })}
            ${SourcePanel({
                sectionID: "itunes_section",
                appName: "iTunes",
                appImage: "itunes-logo.png",
                buttonID: "itunes_fetch"
            })}
        </div>
    `;

    //@ts-ignore

    if (window.renderer) { 

        DataFetchFunctions(); //* for web front-end

    } else {
        //* for error testing purposes
        const FETCH_COMMANDS = document.querySelectorAll("button[id*='fetch']"); //* all buttons for querying backend for resources
        FETCH_COMMANDS.forEach((f_c: Element) => {
            //@ts-ignore
            f_c.onclick = (event: any) => {
                testModal("");
            };
        });
    };

};


renderPage();