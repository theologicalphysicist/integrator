// import {} from "./productivity"
import { NAVIGATION_BAR, NAV_IMAGE, Navbar } from "./global_renderer";

const ProductivityPageRender = () => {
    NAVIGATION_BAR.innerHTML = NAV_IMAGE + Navbar({
        current: "Productivity Page",
        links: {
            Home: "../../../pages/index.html",
            Productivity: "../../../pages/productivity.html",
            Media: "../../../pages/media.html"
        }
    })
}

ProductivityPageRender();