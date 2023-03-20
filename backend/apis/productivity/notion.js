export const getNotionDatabaseDetails = async (notion_client, db_id) => {

    let finished = false;
    let next_cursor = undefined;
    let data = [];

    const ProcessNotionData = (data) => {

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

        const RES = await notion_client.databases.query({
            database_id: db_id,
            page_size: 100,
            start_cursor: next_cursor
        });

        data.push(...ProcessNotionData(RES));
        finished = !RES.has_more;

        if (!finished) {
            next_cursor = RES.next_cursor;
        };

    };

    return data;
}


export const getAllNotionDatabases = async (notion_client) => {

    const ProcessNotionDBData = (data) => {
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

    const RES = await notion_client.search({
        filter: {
            value: "database",
            property: "object"
        }
    });

    return ProcessNotionDBData(RES);;
}