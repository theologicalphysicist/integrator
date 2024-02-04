import { Navbar, LoadingLogo } from "../components/global.js";


const NAVIGATION_BAR: HTMLElement | null = document.getElementById("navigation_area");
const MAIN_SECTION: HTMLElement | null = document.getElementById("main_area");


NAVIGATION_BAR!.innerHTML += Navbar({
    current: "Home",
    links: {
        Home: "../pages/index.html",
        Integrations: "../pages/integration.html",
        Data: "../pages/data.html"
    }
});


MAIN_SECTION!.innerHTML += LoadingLogo();