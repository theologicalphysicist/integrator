const TableHead = (headers) => {
    let rows = "";
    for (const H of headers) {
        rows += `<th>${H}</th>`;
    }
    return (`
            <tr>
                ${rows}
            </tr>
    `);
}

const TableBodyRow = (data) => {
    let rows = "";
    for (const d of data) {
        rows += `
            <tr>
                <td>${d.imageURL}</td>
                <td>${d.name}</td>
                <td>${d.ownerName}</td>
                <td>${d.length}</td>
                <td>${d.type}</td>
            </tr>
        `;
    }
    return (`
        ${rows}
    `);
}

const SpotifyPlaylistTile = (playlist_datum, tile_class) => {
    return (`
        <div class=${tile_class}>
            <img 
                src=${playlist_datum.imageURL} 
                alt="Playlist ${playlist_datum.name}, owned by ${playlist_datum.ownerName}"
                width="100"
                height="100"
            >
            <h2>${playlist_datum.name} by ${playlist_datum.ownerName}</h2>
            <p>Number of songs = ${playlist_datum.length}</p>
        </div>
    `)
}

const SpotifyPlaylistGrid = (playlist_data, grid_id) => {
    let playlist_tiles = "";
    while (playlist_data.length > 0) {
        if (playlist_data.length > 1) {
            playlist_tiles += `
                <div class="playlist-grid-row">
                    ${SpotifyPlaylistTile(playlist_data.shift(), "playlist-tile")}
                    ${SpotifyPlaylistTile(playlist_data.shift(), "playlist-tile")}
                </div>
            `;
        } else if (playlist_data.length === 1) {
            playlist_tiles += `
                <div class="playlist-grid-row">
                    ${SpotifyPlaylistTile(playlist_data.shift(), "playlist-tile")}
                </div>
            `;
        }
    }
    return (`
        <div id=${grid_id}>
            ${playlist_tiles}
        </div>
    `);
}

export {SpotifyPlaylistGrid};