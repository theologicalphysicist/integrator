import mongoose, {Schema, model} from "mongoose";
import { MONGODB_URL } from "../utils/const.js";


mongoose.connect(
    MONGODB_URL(process.env.MONGODB_USER, process.env.MONGODB_PASSWORD), 
    {
        dbName: "sessions",
    }
);


const SESSIONS_SCHEMA = new Schema({
    _id: String,
    expires: Date,
    session: {
        spotify: {
            refreshToken: String,
            accessToken: String,
            scope: String,
            expiryTime: Number,
            tokenType: String
        },
        integrations: []
    }
});
const SESSION = model(
    "session", 
    SESSIONS_SCHEMA, 
    "user_sessions", 
    {
        overwriteModels: false
    }
);


export default SESSION;