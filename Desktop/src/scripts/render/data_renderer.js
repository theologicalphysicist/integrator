import { NAVIGATION_BAR, Navbar, Loading } from "./global_renderer.js";
import {SpotifyPlaylistGrid, NotionDBGrid} from "../components/data.js";


const LOAD_DATA_AREA = document.getElementById("load_data");
LOAD_DATA_AREA.innerHTML = Loading();


const DataPageRender = () => {
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
            const TOKENS = localStorage.getItem("SpotifyTokens");
            console.log(typeof TOKENS);
            console.log(TOKENS);
            LoadSpotifyData();
            break;
        case "NOTION":
            const FETCHED = JSON.parse(localStorage.getItem("NotionFetchData"));
            if (FETCHED) LOAD_DATA_AREA.innerHTML = NotionDBGrid(FETCHED, "database_grid");
            break;
    };

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


DataPageRender();