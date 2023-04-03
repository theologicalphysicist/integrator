import axios from "axios";
import { MongoClient, ServerApiVersion } from "mongodb";
import { SPOTIFY_ACCOUNTS_URL, SPOTIFY_API_URL, MONGODB_URL } from "../utils.js";

export const SPOTIFY_ACCOUNTS_INSTANCE = (client_id, client_secret) => axios.create({
    baseURL: SPOTIFY_ACCOUNTS_URL,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(client_id + ":" + client_secret).toString("base64")}`,
    },
    responseType: "json"
});

export const SPOTIFY_API_INSTANCE = (client_id, client_secret) => axios.create({
    baseURL: SPOTIFY_API_URL,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(client_id + ":" + client_secret).toString("base64")}`,
    },
    responseType: "json"
});

export const MONGODB_CLIENT = async (username, password) => {
    const CLIENT = new MongoClient(MONGODB_URL(username, password));
    try {
        await CLIENT.connect();
        console.log(`Connected to the local database`);
    } catch (err) {
        console.error(`ERROR: ${err}`);
    };
    return CLIENT;
};