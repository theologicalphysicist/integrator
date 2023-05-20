import {IntroductionParagraph, IntegrationSection} from "../components/home.js";
import {Title, NAVIGATION_BAR, Navbar, ErrorModal} from "./global_renderer.js";


//_ WINDOW CONTAINERS
const TITLE_AREA = document.getElementById("main_title");
const INTRO_AREA = document.getElementById("intro_area");
const PRODUCTIVITY_SELECTION_TITLE = document.getElementById("productivity_selection_title");
const PRODUCTIVITY_SELECTION_AREA = document.getElementById("productivity_selection_area");
const MEDIA_SELECTION_TITLE = document.getElementById("media_selection_title");
const MEDIA_SELECTION_AREA = document.getElementById("media_selection_area");
const EXIT_BUTTON = document.getElementById("exit_app");
const MODAL_CONTAINER = document.getElementById("modal_container");
const MAIN = document.getElementById("main");


//_ EVENT HANDLING
if (window.renderer) { //*  incase of web front-end

    renderer.LeaveApp((event) => {

        localStorage.clear();

    });


    renderer.fetchError(async (event, error_res) => {

        if (MODAL_CONTAINER.hidden) {

            MODAL_CONTAINER.innerHTML += ErrorModal(error_res);

            MODAL_CONTAINER.hidden = false;
            MODAL_CONTAINER.style.display = "flex";

            const CLOSE_ERROR_MODAL = document.getElementById("close_modal");
            CLOSE_ERROR_MODAL.onclick = (event) => {

                MODAL_CONTAINER.hidden = true;
                MODAL_CONTAINER.innerHTML = "";
                MODAL_CONTAINER.style.display = "none";

            };

        }

    });

    renderer.init((event, res) => {

        localStorage.clear();
        localStorage.setItem("sessionID", res.id);
        localStorage.setItem("cookies", JSON.stringify(res.cookies));

    });
};


//_ PAGE RENDERING
const DataFetchFunctions = () => {
    const NOTION_FETCH_COMMAND = document.getElementById("notion_fetch");
    NOTION_FETCH_COMMAND.onclick = async (event) => {

        if (localStorage.getItem("recentFetch") != "NOTION") {
            const NOTION_DATABASE_RES = await renderer.fetch(
                `/notion`,
                null,
                {
                    sessionID: localStorage.getItem("sessionID"),
                    cookies: JSON.parse(localStorage.getItem("cookies")),
                },
                "GET"
            );

            console.log({NOTION_DATABASE_RES});

            localStorage.setItem("recentFetch", "NOTION");
            localStorage.setItem("NotionFetchData", JSON.stringify(NOTION_DATABASE_RES.data));
        };

        location.href = "../pages/data.html";

    };

    const SPOTIFY_FETCH_COMMAND = document.getElementById("spotify_fetch");
    SPOTIFY_FETCH_COMMAND.onclick = async (event) => {

        if (localStorage.getItem("recentFetch") != "SPOTIFY") {
            const AUTH_URL = await renderer.fetch(
                `/spotify/authorization`,
                null,
                {
                    sessionID: localStorage.getItem("sessionID"),
                    cookies: JSON.parse(localStorage.getItem("cookies")),
                },
                "GET"
            );

            console.log(AUTH_URL);

            localStorage.setItem("recentFetch", "SPOTIFY");
            renderer.SpotifyAuth(AUTH_URL.data, localStorage.getItem("sessionID"));
        } else {
            location.href = "../pages/data.html";
        };

    };

    const GITHUB_FETCH_COMMAND = document.getElementById("github_fetch");
    GITHUB_FETCH_COMMAND.onclick = async (event) => {

        if (localStorage.getItem("recentFetch") != "GITHUB") {

            await renderer.fetch(
                "/github/repositories",
                null,
                {
                    sessionID: localStorage.getItem("sessionID"),
                    cookies: JSON.parse(localStorage.getItem("cookies")),
                    username: renderer.GITHUB_USERNAME
                },
                "GET"
            )
            .then((res) => {
                console.log(res);
                localStorage.setItem("recentFetch", "GITHUB");
                sessionStorage.setItem("test", "123");
                localStorage.setItem("GithubFetchData", JSON.stringify(res.data));
                location.href = "../pages/data.html";
            })
            .catch((err) => {
                console.error(err);
            });

        } else {
            location.href = "../pages/data.html"
        };

    };
};


const renderPage = async () => {
    
    //_ GENERAL PAGE COMPONENTS
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

    //_ INTEGRATIONS
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

    if (window.renderer) { //* for web front-end

        DataFetchFunctions();

    } else {
            
        const NOTION_FETCH_COMMAND = document.getElementById("notion_fetch");
        NOTION_FETCH_COMMAND.onclick = async (event) => {
            if (MODAL_CONTAINER.hidden) {

                MODAL_CONTAINER.innerHTML += ErrorModal({
                    code: 500,
                    error: "INTERNAL SERVER ERROR",
                    details: "mock error. ignore this."
                });

                MODAL_CONTAINER.hidden = false;

                const CLOSE_ERROR_MODAL = document.getElementById("close_modal");
                CLOSE_ERROR_MODAL.onclick = (event) => {

                    MODAL_CONTAINER.hidden = true;
                    MODAL_CONTAINER.innerHTML = null;

                };
                
            };
        }
    }

};


await renderPage();