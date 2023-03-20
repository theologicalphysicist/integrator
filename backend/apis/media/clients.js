import axios from "axios";

export const SPOTIFY_ACCOUNTS_INSTANCE = (client_id, client_secret) => axios.create({
    baseURL: "https://accounts.spotify.com",
        headers: {
        "Authorization": `Basic ${Buffer.from(client_id + ":" + client_secret).toString("base64")}`,
        "Content-Type": "applicaton/x-www-form-urlencoded;charset=UTF-8"
    },
    responseType: "json"
});

export const SPOTIFY_API_INSTANCE = (client_id, client_secret) => axios.create({
    baseURL: "https://api.spotify.com/v1",
    headers: {
        "Authorization": `Basic ${Buffer.from(client_id + ":" + client_secret).toString("base64")}`,
        "Content-Type": "applicaton/x-www-form-urlencoded;charset=UTF-8"
    },
    responseType: "json"
});