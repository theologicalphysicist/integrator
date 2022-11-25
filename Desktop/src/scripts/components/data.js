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

export {DataTable}