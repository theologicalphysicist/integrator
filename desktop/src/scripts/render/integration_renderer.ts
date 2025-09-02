import { Navbar, LoadingLogo } from "../components/global.js";
import { IntegrationButtons } from "../components/integration.js";

import {ComponentDescription} from "../types.js";


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

// MAIN_SECTION!.innerHTML += LoadingLogo();

function Fetches() {
    const TEST_INTEGRATION_COMMAND: HTMLElement | null = document.getElementById("test_integration");

    TEST_INTEGRATION_COMMAND!.onclick = async (event) => {

        //@ts-ignore
        const INTEGRATION_RES = await renderer.fetch(
            "/integration/test",

        )

    }
}


function renderPage() {
    const INTEGRATION_BUTTON_TEXTS: ComponentDescription[] = [
        {
            text: "CREATE INTEGRATION",
            id: "",
            classes: []
        },
        {
            text: "UPDATE INTEGRATION",
            id: "",
            classes: []
        },
        {
            text: "SYNC",
            id: "",
            classes: []
        
        },
        {
            text: "TEST INTEGRATION: SPOTIFY -> APPLE MUSIC",
            id: "test_integration"
        }
    ];

    MAIN_SECTION!.innerHTML += IntegrationButtons(INTEGRATION_BUTTON_TEXTS);

}


renderPage();