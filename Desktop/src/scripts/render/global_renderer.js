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


const Loading = () => {
    return `
        <div id="loading_container">
            <h4>Loading...</h4>
            <div id="loading_symbol">
                <div id="loading_top"></div>
                <div id="loading_bottom_left"></div>
                <div id="loading_bottom_right"></div>
            
            </div>
        
        </div>
    `;
};


export {NAVIGATION_BAR, Navbar, Title, Loading, }