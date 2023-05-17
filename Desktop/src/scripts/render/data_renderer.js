import { NAVIGATION_BAR, Navbar, Loading } from "./global_renderer.js";
import {SpotifyPlaylistGrid, NotionDBGrid, GithubDataGrid} from "../components/data.js";

import {LANGUAGE_COLOURS} from "../../const/languageColors.js";


const LOAD_DATA_AREA = document.getElementById("load_data");
LOAD_DATA_AREA.innerHTML = Loading();


const sum = (numbers) => {
    let total = 0;

    numbers.forEach((num) => {total += num;});

    return total;
};


const loadGithubRepositoryData = async (repo_names) => {
    let repo_query_string = "";

    repo_names.forEach((r_n) => {repo_query_string += `&repositories=${r_n}`;});

    const LANGUAGES_RES = await renderer.fetch(
        "/github/repository/languages",
        null,
        {
            sessionID: localStorage.getItem("sessionID"),
            cookies: JSON.parse(localStorage.getItem("cookies")),
            username: renderer.GITHUB_USERNAME
        },
        "GET"
    );

    return LANGUAGES_RES;
};


const LoadSpotifyData = async () => {
    const PLAYLIST_RES = await renderer.fetch(
        "/spotify/playlists",
        null,
        {
            sessionID: localStorage.getItem("sessionID"),
            cookies: JSON.parse(localStorage.getItem("cookies")),
        },
        "GET"
    );
    
    LOAD_DATA_AREA.innerHTML = SpotifyPlaylistGrid(PLAYLIST_RES.data, "playlist_grid");
};


const DataPageRender = async () => {
    let fetched;

    NAVIGATION_BAR.innerHTML += Navbar({
        current: "Data Page",
        links: {
            Home: "../pages/index.html",
            data: "../pages/data.html",
            Media: "../pages/media.html"
        }
    });

    switch (localStorage.getItem("recentFetch")) {

        case "SPOTIFY":

            LoadSpotifyData();

            break;

        case "NOTION":

            fetched = JSON.parse(localStorage.getItem("NotionFetchData"));
            if (fetched) LOAD_DATA_AREA.innerHTML = NotionDBGrid(fetched, "database_grid");

            break;

        case "GITHUB": //TODO: REFACTOR THIS!

            fetched = JSON.parse(localStorage.getItem("GithubFetchData"));

            const REPO_NAMES = fetched.map((f) => f.repoName);
            const REPO_LANGUAGES = await loadGithubRepositoryData(REPO_NAMES);
            LOAD_DATA_AREA.innerHTML = fetched ? GithubDataGrid(fetched, "database_grid", REPO_LANGUAGES) : null;

            //_ SET LANGUAGE IMAGE OF REPOSITORY
            for (const REPO in REPO_LANGUAGES) {
                for (const LANGS in REPO_LANGUAGES[REPO]) {
                    const TOTAL = sum(Object.values(REPO_LANGUAGES[REPO]));
                    const CURRENT_SPAN = document.getElementById(`${REPO}_${LANGS}`);

                    CURRENT_SPAN.style.backgroundColor = LANGUAGE_COLOURS[LANGS];
                    CURRENT_SPAN.style.width = ((REPO_LANGUAGES[REPO][LANGS] / TOTAL) * 100) + "%";
                }
            };

            break;
    };

};


await DataPageRender();
