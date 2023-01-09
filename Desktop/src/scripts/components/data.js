const TableHead = (headers) => {
    let rows = "";
    for (const H of headers) {
        rows += `<th>${H}</th>`;
    }
    console.log(rows);
    return (`
            <tr>
                ${rows}
            </tr>
    `);
}

const TableBodyRow = (rC, data) => {
    let rows = "";
    for (const d of data) {
        rows += `
            <tr class=${rC}>
                <td>${d.revisionType}</td>
                <td>${d.deadline}</td>
                <td>${d.module}</td>
                <td>${d.state}</td>
                <td>${d.name}</td>
            </tr>
        `;
    }
    return (`
        ${rows}
    `);
}

const DataTable = (tableID, rowClass, data) => {
    return (`
        <table id=${tableID}>
            <thead>
                ${TableHead(Object.keys(data[0]))}
            </thead>
            <tbody>
                ${TableBodyRow(rowClass, data)}
            </tbody>
        </table>
    `);
}

const NotionDBTile = (database_datum) => {
    return (`
        <div class="database-tile">
            <h2><a href=${database_datum.url} target="_blank">${database_datum.title}</a></h2>
            <p>${Object.keys(database_datum.properties)}</p>
        </div>
    `);
}

const NotionDBGrid = (database_data, grid_id) => {
    let database_tiles = "";
    while (database_data.length > 0) {
        if (database_data.length > 1) {
            database_tiles += `
                <div class="database-grid-row">
                    ${NotionDBTile(database_data.shift())}
                    ${NotionDBTile(database_data.shift())}
                </div>
            `;
        } else {
            database_tiles += `
                <div class="database-grid-row">
                    ${NotionDBTile(database_data.shift())}
                </div>
            `;
        }
    }
    return (`
        <div id="database_grid">
            ${database_tiles}
        </div>
    `);

}

export {NotionDBGrid}