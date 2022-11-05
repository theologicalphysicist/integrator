const Title = () => {
    const TITLE_TEXT = "Integrator";
    
    return (
        `
            <h1>${TITLE_TEXT}</h1>
        `
    );
}
        
const IntroList = (OLI, ILI) => {
    let inner_list = "";
    ILI.forEach((item) => inner_list += `<li>${item}</li>`)

    return `<ul> 
                <li>${OLI[0]}</li>
                <ul>
                    ${inner_list}
                </ul>
                <li>${OLI[1]}</li>
            </ul>` 
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
        "Microsoft To-do"
    ];

    return (
        `
            <p>${PARAGRAPH_TEXT}</p>
            ${IntroList(OUTER_LIST_ITEMS, INNER_LIST_ITEMS)}
        `
    )
}

export {Title, IntroductionParagraph};