export const Title = (text: string) => {
    
    return (`
       <h1>${text}</h1>
    `);
};


export const Navbar = (props: any) => {
    let LINKS = "";
    Object.keys(props.links).forEach((l: string) => {
        LINKS += `
            <li>
                <a class="${props.current === l ? "current" : ""}" href="${props.links[l]}">${l}</a>
            </li>
        `;
    });
    
    return (`
        <ul>
            ${LINKS}
        </ul>
    `);
};


export const LoadingLogo = () => {

    return `
        <div id="logo_container">
            <div class="logo_circle" id="circle1"></div>
            <div class="logo_circle" id="circle3"></div>
            <div class="logo_circle" id="circle2"></div>
        </div>
        <p>loading...</p>
    `;
};


export const ErrorModal = (error_res: any) => {

    return `
        <div class="modal-popup" id="error_modal">
            <h1>ERROR ${error_res.code}: ${error_res.error}</h1>
            <p>${error_res.details}</p>
            <button id="close_modal">CLOSE</button>
        </div>
    `;
};


export const SecondHeader = (text: string) => {

    return `
        <h2>${text}</h2>
    `;
};