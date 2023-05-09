import { NAVIGATION_BAR, Navbar, Loading } from "./global_renderer.js";
import {SpotifyPlaylistGrid, NotionDBGrid} from "../components/data.js";


const LOAD_DATA_AREA = document.getElementById("load_data");
LOAD_DATA_AREA.innerHTML = Loading();


const LoadSpotifyData = async () => {


    const PLAYLIST_RES = await renderer.fetch(
        "/spotify/playlists",
        null,
        localStorage.getItem("sessionID"),
        JSON.parse(localStorage.getItem("cookies")),
        "GET"
    );
    
    LOAD_DATA_AREA.innerHTML = SpotifyPlaylistGrid(PLAYLIST_RES.data, "playlist_grid");
};


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
            LoadSpotifyData();
            break;
        case "NOTION":
            const FETCHED = JSON.parse(localStorage.getItem("NotionFetchData"));

            localStorage.removeItem("NotionFetchData");
            LOAD_DATA_AREA.innerHTML = NotionDBGrid(FETCHED, "database_grid");
            break;
    };

};




DataPageRender();