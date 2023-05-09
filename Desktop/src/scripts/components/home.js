const IntroList = (OLI, ILI) => {
    let inner_list = "";
    ILI.forEach((item) => inner_list += `<li>${item}</li>`);

    return `
        <ul> 
            <li>${OLI[0]}</li>
            <ul>
                ${inner_list}
            </ul>
            <li>${OLI[1]}</li>
        </ul>
    `;
}

const IntroductionParagraph = () => {
    const PARAGRAPH_TEXT = "This is a tool to resolve two separate issues:";
    const OUTER_LIST_ITEMS = [
        "Integrating all of my productivity tools, namely:", 
         "Integrating my music apps, to easily sync, transfer & update playlists between apps"
    ];
    const INNER_LIST_ITEMS = [
        "Notion",
        "Focus To-do",
        "Pomodone",
        "Pomotodo",
        "Microsoft To-do",
        "Github"
    ];

    return (`
        <p>${PARAGRAPH_TEXT}</p>
        ${IntroList(OUTER_LIST_ITEMS, INNER_LIST_ITEMS)}
    `);
}

const IntegrationSection = (props) => {
    return (`
        <div id="${props.sectionID}" class="integration-section">
            <h2>${props.appName} Integrations</h2>
            <div class="image-container">
                <img src="../public/img/${props.appImage}" alt="${props.appName} logo">
            </div>
            <p>Fetch & view data from ${props.appName}</p>
            <div class="button-container">
                <button id="${props.buttonID}">Fetch</button>
            </div>
        </div>
    `);
}

export {IntroductionParagraph, IntegrationSection};