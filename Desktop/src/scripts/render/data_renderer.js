import { NAVIGATION_BAR, Navbar, Loading } from "./global_renderer.js";
import {SpotifyPlaylistGrid, NotionDBGrid, GithubDataGrid} from "../components/data.js";

import {LANGUAGE_COLOURS} from "../../const/languageColors.js";


const LOAD_DATA_AREA = document.getElementById("load_data");
LOAD_DATA_AREA.innerHTML = Loading();



const sum = (numbers) => {
    console.log(numbers);
    let total = 0;

    numbers.forEach((num) => {
        total += num;
    });

    return total;
};


const DataPageRender = async () => {
    NAVIGATION_BAR.innerHTML += Navbar({
        current: "Data Page",
        links: {
            Home: "../pages/index.html",
            data: "../pages/data.html",
            Media: "../pages/media.html"
        }
    });
    let fetched, repo_languages;
    switch (localStorage.getItem("recentFetch")) {
        case "SPOTIFY":
            LoadSpotifyData();
            break;
        case "NOTION":
            fetched = JSON.parse(localStorage.getItem("NotionFetchData"));
            if (fetched) LOAD_DATA_AREA.innerHTML = NotionDBGrid(fetched, "database_grid");
            break;
        case "GITHUB":
            fetched = JSON.parse(localStorage.getItem("GithubFetchData"));
            const REPO_NAMES = fetched.map((f) => f.repoName);
            repo_languages = await loadGithubRepositoryData(REPO_NAMES);
            LOAD_DATA_AREA.innerHTML += fetched ? GithubDataGrid(fetched, "database_grid", repo_languages) : null;
            break;
    };
    
    //_ SET LANGUAGE IMAGE OF REPOSITORY
    for (const REPO in repo_languages) {
        for (const LANGS in repo_languages[REPO]) {
            const TOTAL = sum(Object.values(repo_languages[REPO]));
            const CURRENT_SPAN = document.getElementById(`${REPO}_${LANGS}`);
            CURRENT_SPAN.style.backgroundColor = LANGUAGE_COLOURS[LANGS];
            console.log(((repo_languages[REPO][LANGS] / TOTAL) * 100) + "%");
            CURRENT_SPAN.style.width = ((repo_languages[REPO][LANGS] / TOTAL) * 100) + "%";
        }
    };

};


const loadGithubRepositoryData = async (repo_names) => {
    let repo_query_string = "";
    repo_names.forEach((r_n) => {
        repo_query_string += `&repositories=${r_n}`;
    });
    const LANGUAGES_RES = await (await fetch(`${renderer.EXPRESS_BACKEND_API_URL}/github_repository_languages?username=${renderer.GITHUB_USERNAME}${repo_query_string}`)).json();
    return LANGUAGES_RES
};


const LoadSpotifyData = async () => {

    const PLAYLIST_RES = await fetch(`${renderer.EXPRESS_BACKEND_API_URL}/spotify_playlists/?sessionID=${localStorage.getItem("sessionID")}`, {
        method: "GET",
        mode: "cors",
        credentials: "include",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    });
    const PLAYLIST_DATA = await PLAYLIST_RES.json();
    console.log(PLAYLIST_DATA);
    LOAD_DATA_AREA.innerHTML = SpotifyPlaylistGrid(PLAYLIST_DATA, "playlist_grid");
};

await DataPageRender();
