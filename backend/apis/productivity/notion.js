import { wrapResponse } from "../../utils/func.js";

export const getNotionDatabaseDetails = async (notion_client, db_id) => {
    let finished = false;
    let next_cursor = undefined;
    let error = {
        present: false,
        details: null
    };
    let data = [];

    const processResponse = (data) => {
        let items = [];

        data.results.forEach((i) => {
            items.push({
                revisionType: i.properties["Revision Type"].select.name,
                deadline: i.properties["Deadline"].date,
                module: i.properties["Module"].select.name,
                state: i.properties["State"].select.name,
                name: i.properties["Name"].title[0].text.content
            });
        });

        return items;
    };

    while (!finished) {
        await notion_client.databases.query({
            database_id: db_id,
            page_size: 100,
            start_cursor: next_cursor
        })
        .then((notion_res) => {

            data.push(...processResponse(notion_res));

            finished = !notion_res.has_more;
            if (!finished) next_cursor = notion_res.next_cursor;
        })
        .catch((err) => {
            console.error(err);

            finished = true;

            error = {
                present: true,
                details: err
            };
        });
    };

    return wrapResponse(error, data);
};


export const getAllNotionDatabases = async (notion_client) => {
    let error = {
        present: false,
        details: null
    };
    let data = {};

    const processResponse = (data) => {
        let items = [];

        data.results.forEach((i) => {
            items.push({
                title: i.title[0].plain_text,
                properties: i.properties,
                url: i.url
            });
        });

        return items;
    };

    await notion_client.search({
        filter: {
            value: "database",
            property: "object"
        }
    })
    .then((notion_res) => {

        data = processResponse(notion_res);

    })
    .catch((err) => {
        console.error(err);

        error = {
            present: true,
            details: err
        };
    });

    return wrapResponse(error, data);
};

