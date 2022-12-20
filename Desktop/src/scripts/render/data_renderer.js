import { NAVIGATION_BAR, NAV_IMAGE, Navbar } from "./global_renderer.js";
import * as components from "../components/data.js";
// import info from "../../../public/info.jsonc";

const LOAD_DATA_AREA = document.getElementById("load_data");

const pinger = async () => {
    const res = await renderer.bing();
    console.log(res);
}

const DataPageRender = async () => {
    NAVIGATION_BAR.innerHTML = NAV_IMAGE + Navbar({
        current: "Data Page",
        links: {
            Home: "../pages/index.html",
            data: "../pages/data.html",
            Media: "../pages/media.html"
        }
    });
    switch (localStorage.getItem("recentFetch")) {
        case "Spotify":
            const TOKENS = localStorage.getItem("SpotifyTokens");
            console.log(typeof TOKENS);
            console.log(TOKENS);
            await LoadSpotifyData();
            break;
        case "Notion":
            break;
    }
}

const LoadSpotifyData = async () => {
    console.log("HERE");
    const PLAYLIST_RES = await fetch(`${renderer.EXPRESS_BACKEND_API_URL}/spotify/?redirectURI=http://localhost:3000/spotify_playlists`, {
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
    LOAD_DATA_AREA.innerHTML = components.SpotifyPlaylistGrid(PLAYLIST_DATA, "playlist_grid");
    
    
}

// pinger();
await DataPageRender();