import {Buffer as $ktuuV$Buffer} from "buffer";
import $ktuuV$express from "express";
import "path";
import "url";
import $ktuuV$cors from "cors";
import $ktuuV$cookieparser from "cookie-parser";
import "bytenode";
import {Client as $ktuuV$Client} from "@notionhq/client";
import $ktuuV$querystring from "querystring";
import $ktuuV$axios from "axios";
import $ktuuV$request from "request";



const $5eeb20b981e3adfe$var$NOTION_CLIENT = new (0, $ktuuV$Client)({
    auth: "secret_5Z4xuriM9F5j8rvUf3VkNFlY5mTIkgMQRTE7BbQnADE"
});
const $5eeb20b981e3adfe$var$ProcessNotionData = (data)=>{
    let items = [];
    data.results.forEach((i)=>{
        let item = {
            revisionType: i.properties["Revision Type"].select.name,
            deadline: i.properties["Deadline"].date,
            module: i.properties["Module"].select.name,
            state: i.properties["State"].select.name,
            name: i.properties["Name"].title[0].text.content
        };
        items.push(item);
    });
    return items;
};
const $5eeb20b981e3adfe$export$e4c45d4f70fbc66b = async ()=>{
    // console.log(process.env.NOTION_TOKEN);
    let finished = false;
    let next_cursor = undefined;
    let data = [];
    while(!finished){
        const res = await $5eeb20b981e3adfe$var$NOTION_CLIENT.databases.query({
            database_id: "6ae597c5cdf2447096c1a4a7b7c77b44",
            page_size: 100,
            start_cursor: next_cursor
        });
        data.push(...$5eeb20b981e3adfe$var$ProcessNotionData(res));
        finished = !res.has_more;
        if (!finished) next_cursor = res.next_cursor;
    }
    return data;
};
const $5eeb20b981e3adfe$var$ProcessNotionDBData = (data)=>{
    let items = [];
    data.results.forEach((i)=>{
        // let item = {
        //     title: i.title.text.content
        // }
        // console.log(i);
        items.push({
            title: i.title[0].plain_text,
            properties: i.properties,
            url: i.url
        });
    // console.log(i.properties);
    });
    // console.log({items});
    return items;
};
const $5eeb20b981e3adfe$export$918bcce5f6d51ee0 = async ()=>{
    const RES = await $5eeb20b981e3adfe$var$NOTION_CLIENT.search({
        filter: {
            value: "database",
            property: "object"
        }
    });
    const PROCESSED_RES = $5eeb20b981e3adfe$var$ProcessNotionDBData(RES);
    return PROCESSED_RES;
// console.log(RES);
};





const $16267a65dfdc5211$export$5e511398f15fb7c = "https://accounts.spotify.com";
const $16267a65dfdc5211$export$fbb7a7071dee09c8 = "https://api.spotify.com/v1";
const $16267a65dfdc5211$export$9e15fb06e64c4810 = (length)=>{
    let text = "";
    const POSSIBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(let i = 0; i < length; i++)text += POSSIBLE.charAt(Math.floor(Math.random() * POSSIBLE.length));
    return text;
};
const $16267a65dfdc5211$export$8aab42f85ec2b3dd = (res, state_str, redirect_URI)=>{
    const QS = (0, $ktuuV$querystring).stringify({
        response_type: "code",
        client_id: "2e8b7b174b3541389cc323339a287cb4",
        redirect_uri: redirect_URI,
        scope: "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-library-modify user-library-read user-read-email user-read-private",
        state: state_str
    });
    res.redirect(302, `${$16267a65dfdc5211$export$5e511398f15fb7c}/authorize?${QS}`);
};
const $16267a65dfdc5211$export$f901672b588105c0 = async (auth_options, res)=>{
    // const RES = await fetch(auth_options.url, {
    //     method: 'POST',
    //     body: JSON.stringify(auth_options.form),
    //     headers: auth_options.headers
    // });
    // console.log(await RES.text());
    (0, $ktuuV$request).post(auth_options, (err, token_res, body)=>{
        if (err || token_res.statusCode != 200) console.error(`ERROR: ${body.error}`);
        else res.send({
            accessToken: body.access_token,
            refreshToken: body.refresh_token,
            scope: body.scope,
            expiry: body.expires_in
        });
    });
// const AUTH_OPTIONS = {
//     method: "post",
//     url: `${SPOTIFY_ACCOUNTS_URL}/api/token`,
//     data: qs.stringify(auth_options.form),
//     headers: auth_options.headers,
//     withCredentials: true,
//     response_type: "json"
// };
// console.log(AUTH_OPTIONS);
// axios(AUTH_OPTIONS).then(token_res => {
//     console.log("HERE");
//     if (err || token_res.status !== 200) {
//         ErrorRedirect(err);
//     } else {
//         console.log(token_res.data);
//         res = {
//             accessToken: token_res.body.access_token,
//             tokenType: token_res.body.token_type,
//             expiry: token_res.body.expires_in,
//             refreshToken: token_res.body.refresh_token,
//         }
//     }
// }).catch(err => {
//     if (err.response) {
//         console.log(err.toJSON());
//         console.log(err.response.data);
//         // console.log(err.request);
//         // console.log(err.response.data);
//         // console.log(err.response.status);
//         // console.log(err.response.headers);
//     } else if (err.request) {
//         console.log(err.request);
//     } else {
//         console.log(`ERROR: ${err.message}`);
//     }
// });
// return res;
};
const $16267a65dfdc5211$var$ProcessPlaylists = (res)=>{
    let formatted_res = [];
    for (const PLAYLIST of res)PLAYLIST.owner.display_name === "gauss" && formatted_res.push({
        imageURL: PLAYLIST.images[0].url,
        name: PLAYLIST.name,
        ownerName: PLAYLIST.owner.display_name,
        length: PLAYLIST.tracks.total,
        type: PLAYLIST.type
    });
    return formatted_res;
};
const $16267a65dfdc5211$export$1dc22eb60e7f2b25 = async (auth_options, res)=>{
    (0, $ktuuV$request).post(auth_options, async (err, auth_res, body)=>{
        let playlist_response = [];
        if (err || auth_res.statusCode !== 200) {
            console.log(err);
            console.log("UNSUCCESSFUL");
        } else {
            let index = 0;
            let next = "";
            while(next !== null){
                const OPTIONS = {
                    method: "GET",
                    url: `${$16267a65dfdc5211$export$fbb7a7071dee09c8}/me/playlists`,
                    params: {
                        offset: index,
                        limit: 50
                    },
                    headers: {
                        "Authorization": `Bearer ${body.access_token}`
                    }
                };
                // Request.get(OPTIONS, (err, playlist_res, playlist_body) => {
                //     if (err || playlist_res.statusCode !== 200) {
                //         console.error(playlist_body.error.message);
                //     } else {
                //         next = playlist_body.next;
                //         offset = playlist_body.offset
                //         playlist_response.push(ProcessPlaylists(playlist_body.items));
                //         console.log(playlist_response);
                //     }
                // });
                await (0, $ktuuV$axios)(OPTIONS).then((playlist_res)=>{
                    next = playlist_res.data.next;
                    index = playlist_res.data.limit;
                    playlist_response.push($16267a65dfdc5211$var$ProcessPlaylists(playlist_res.data.items));
                }).catch((err)=>{
                    console.error(`ERROR \n STATUS CODE: ${err.response} \n STATUS TEXT: ${err.response}`);
                });
            }
            res.send(playlist_response.flat());
        }
    });
};
const $16267a65dfdc5211$export$d54bd205d21b2e3a = (err, req, res)=>{
    console.error(err);
// res.redirect("/#" + queryString.stringify({
//     error: err
// }));
};








var $b961a1332ddaab65$require$Buffer = $ktuuV$Buffer;
// const FILENAME = fileURLToPath(import.meta.url);
// const DIRNAME = path.dirname(FILENAME);
const $b961a1332ddaab65$var$app = (0, $ktuuV$express)();
$b961a1332ddaab65$var$app.use((0, $ktuuV$cookieparser)());
$b961a1332ddaab65$var$app.use((0, $ktuuV$cors)());
$b961a1332ddaab65$var$app.get("/", (req, res)=>{
    res.send(`CORS-enabled Integrator App listening on port ${"3000"}`);
});
//_ NOTION
$b961a1332ddaab65$var$app.get("/notion_db", async (req, res)=>{
    const NOTION_DB_RESPONSE = await (0, $5eeb20b981e3adfe$export$918bcce5f6d51ee0)();
    console.log(NOTION_DB_RESPONSE);
    res.send(NOTION_DB_RESPONSE);
});
$b961a1332ddaab65$var$app.get("/notion_uni_db", async (req, res)=>{
    console.log(req);
    const NOTION_RESPONSE = await (0, $5eeb20b981e3adfe$export$e4c45d4f70fbc66b)();
    res.send(JSON.stringify(NOTION_RESPONSE, null, 2));
});
//_ SPOTIFY
$b961a1332ddaab65$var$app.get("/spotify", (req, res)=>{
    const STATE = (0, $16267a65dfdc5211$export$9e15fb06e64c4810)(16);
    console.debug(req.query.redirectURI);
    (0, $16267a65dfdc5211$export$8aab42f85ec2b3dd)(res, STATE, req.query.redirectURI);
});
$b961a1332ddaab65$var$app.get("/spotify_callback", (req, res)=>{
    const STATE = req.query.state || null;
    console.log(STATE);
    if (STATE === null) (0, $16267a65dfdc5211$export$d54bd205d21b2e3a)("state mismatch", req, res);
    else res.send({
        authStatus: true,
        queryCode: req.query.code
    });
});
$b961a1332ddaab65$var$app.get("/spotify_tokens", async (req, res)=>{
    const AUTH_OPTIONS = {
        url: `${(0, $16267a65dfdc5211$export$5e511398f15fb7c)}/api/token`,
        form: {
            code: req.query.queryCode,
            redirect_uri: "http://localhost:3000/spotify_callback",
            grant_type: "authorization_code"
        },
        headers: {
            "Authorization": `Basic ${new $b961a1332ddaab65$require$Buffer("2e8b7b174b3541389cc323339a287cb4:5721a164872c4b0aa368a71441b72d3b").toString("base64")}`,
            "Content-Type": "applicaton/x-www-form-urlencoded;charset=UTF-8"
        },
        json: true
    };
    await (0, $16267a65dfdc5211$export$f901672b588105c0)(AUTH_OPTIONS, res);
});
$b961a1332ddaab65$var$app.get("/spotify_playlists", async (req, res)=>{
    const AUTH_OPTIONS = {
        url: `${(0, $16267a65dfdc5211$export$5e511398f15fb7c)}/api/token`,
        form: {
            code: req.query.code,
            redirect_uri: "http://localhost:3000/spotify_playlists",
            grant_type: "authorization_code"
        },
        headers: {
            "Authorization": `Basic ${new $b961a1332ddaab65$require$Buffer("2e8b7b174b3541389cc323339a287cb4:5721a164872c4b0aa368a71441b72d3b").toString("base64")}`,
            "Content-Type": "applicaton/x-www-form-urlencoded"
        },
        json: true
    };
    await (0, $16267a65dfdc5211$export$1dc22eb60e7f2b25)(AUTH_OPTIONS, res);
});
//_ MICROSOFT
$b961a1332ddaab65$var$app.listen("3000", ()=>{
    console.log(`CORS-enabled Integrator App listening on port ${"3000"}`);
});


//# sourceMappingURL=app.js.map
