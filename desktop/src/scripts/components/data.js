
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
};


//TODO: Refactor to use 1 set of functions for all data fetched
const TableBodyRow = (data, rC) => {
    let rows = "";
    for (const d of data) {
        console.log(d);
        rows += `
            ${d}
        `;
    }
    return `
        ${rows}
    `;
};


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
};


export const SpotifyPlaylistGrid = (playlist_data, grid_id) => {
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
    return `
        <div id=${grid_id}>
            ${playlist_tiles}
        </div>
    `;
};


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
};


//_ NOTION
const NotionDBTile = (database_datum) => {
    return (`
        <div class="database-tile">
            <h2><a href=${database_datum.url} target="_blank">${database_datum.title}</a></h2>
            <p>${Object.keys(database_datum.properties)}</p>
        </div>
    `);
};


export const NotionDBGrid = (database_data, grid_id) => {
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
        <div id=${grid_id}>
            ${database_tiles}
        </div>
    `);
};


//_ GITHUB
const GitHubLanuagesSpan = (repo_languages, repo_name) => {

    let language_spans = "";

    Object.keys(repo_languages).forEach((key) => {
        language_spans += `<div id="${repo_name}_${key}"></div>`;

    });

    return language_spans;
};

const GithubLanguagesImage = (repo_languages, repo_name) => {
    return `
        <div class="languages-span">
            ${GitHubLanuagesSpan(repo_languages, repo_name)}
        </div>
    `;
};


const GithubDataTile = (datum, repo_languages, repo_name) => {
    return `
        <div class="database-tile">
            <h2>${datum.repoName}</h2>
            <p>${datum.description ? ("Description: " + datum.description) : "No description"}</p>
            ${GithubLanguagesImage(repo_languages, repo_name)}
            <br />
            <p>Last Update: ${datum.dateOfLastUpdate}</p>
            <p>Visibility: ${datum.visibility}</p>
            <p>Open Issues: ${datum.numberOfOpenIssues}</p>
        </div>
    `;
};


export const GithubDataGrid = (data, grid_id, repo_languages) => {
    let tiles = "";
    while (data.length > 0) {
        if (data.length > 1) {
            const DATUMS = [data.shift(), data.shift()];
            tiles += `
                <div class="database-grid-row">
                    ${GithubDataTile(DATUMS[0], repo_languages[DATUMS[0].repoName], DATUMS[0].repoName) + GithubDataTile(DATUMS[1], repo_languages[DATUMS[1].repoName], DATUMS[1].repoName)}
                </div>
            `;
        } else {
            const DATUM = data.shift();
            tiles += `
                <div class="database-grid-row">
                    ${GithubDataTile(DATUM, repo_languages[DATUM.repoName])}
                </div>
            `;
        }
    };

    return `
        <div id=${grid_id}>
            ${tiles}
        </div>
    `;
};