import {Client} from "@notionhq/client";

const NOTION_CLIENT = new Client({
    auth: process.env.NOTION_TOKEN,
});

const ProcessNotionData = (data) => {
    let items = [];
    data.results.forEach((i) => {
        let item = {
            revisionType: i.properties["Revision Type"].select.name,
            deadline: i.properties["Deadline"].date,
            module: i.properties["Module"].select.name,
            state: i.properties["State"].select.name,
            name: i.properties["Name"].title[0].text.content
        }
        items.push(item);
    });
    return items;
}

export const NotionFetch = async () => {
    // console.log(process.env.NOTION_TOKEN);
    let finished = false;
    let next_cursor = undefined;
    let data = [];
    while (!finished) {
        const res = await NOTION_CLIENT.databases.query({
            database_id: process.env.NOTION_UNI_DB_ID,
            page_size: 100,
            start_cursor: next_cursor
        });
        data.push(...ProcessNotionData(res));
        finished = !res.has_more;
        if (!finished) {
            next_cursor = res.next_cursor;
        }
    }
    return data;
}