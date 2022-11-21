const ProductivitySection = (props) => {
    return (
        `
            <div id="${props.sectionID}" class="productivity-section">
                <h2>${props.appName} Integrations</h2>
                <div class="image-container">
                    <img src="../public/img/${props.appImage}" alt="${props.appName} logo">
                </div>
                <p>Fetch & view data from ${props.appName}</p>
                <div class="button-container">
                    <button id="${props.buttonID}">Fetch</button>
                </div>
            </div>
        `
    )
}

const ProductivityRow = () => {

}
export {ProductivitySection};