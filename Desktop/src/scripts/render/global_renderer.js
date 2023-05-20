const NAVIGATION_BAR = document.getElementById("navigation_area");


const Title = (text) => {    
    return (`
       <h1>${text}</h1>
    `);
};


const Navbar = (props) => {
    let LINKS = "";
    ["Home", "Data Tools", "Media Tools"].map((l) => {
    return (`
        <li>
            <a class="${props.current === l ? "current" : ""}" href="${props.links[l.split(" ")[0]]}">${l}</a>
        </li>
    `)
    }).map((al) => LINKS += al);
    
    return (`
        <ul>
            ${LINKS}
        </ul>
    `);
};


const LoadingLogo = () => {

    return `
        <div id="logo_container">
            <div class="logo_circle" id="circle1"></div>
            <div class="logo_circle" id="circle3"></div>
            <div class="logo_circle" id="circle2"></div>
        </div>
    `;
};


const ErrorModal = (error_res) => {

    return `
        <div class="modal-popup" id="error_modal">
            <h1>ERROR ${error_res.code}: ${error_res.error}</h1>
            <p>${error_res.details}</p>
            <button id="close_modal">CLOSE</button>
        </div>
    `;
};


export {NAVIGATION_BAR, Navbar, Title, ErrorModal, LoadingLogo}