const NAVIGATION_BAR = document.getElementById("navigation_area");
const NAV_IMAGE = NAVIGATION_BAR.innerHTML;

const Navbar = (props) => {
    var LINKS = "";
    ["Home", "Productivity Tools", "Media Tools"].map((l) => {
    return (
        `
        <li>
            <a class="${props.current === l ? "current" : ""}" href="${props.links[l.split(" ")[0]]}">${l}</a>
        </li>
        `
        )
    }).map((al) => LINKS += al);
    
    return (
        `
        <ul>
            ${LINKS}
            </ul>
    `
    )
}

export {NAVIGATION_BAR, NAV_IMAGE, Navbar}