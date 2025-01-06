import mongoose, {Model, Schema} from "mongoose";

//_ LOCAL
import { ISession, IIntegration } from "./types.js";


//_ SCHEMA
const SESSIONS_SCHEMA = (mongoose_conn: typeof mongoose): Schema => new mongoose_conn.Schema({
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
    }
});

const INTEGRATIONS_SCHEMA = (mongoose_conn: typeof mongoose): Schema => new mongoose_conn.Schema({
    _id: String,
    lastSync: Number,
    source: String,
    destination: String,
    sessionID: String,
    data: {}
});

//_ MODELS
export const SESSION = (mongoose_conn: typeof mongoose): Model<ISession> => mongoose_conn.model<ISession>(
    "user-session", 
    SESSIONS_SCHEMA(mongoose_conn), 
    "user_sessions", 
    {
        overwriteModels: false
    }
);

export const PRODUCTIVITY_INTEGRATION_MODEL = (mongoose_conn: typeof mongoose): Model<IIntegration> => mongoose_conn.model<IIntegration>(
    "productivity collection",
    INTEGRATIONS_SCHEMA(mongoose_conn),
    "productivity_integrations",
    {
        overwriteModels: false
    }
);

export const MUSIC_INTEGRATION_MODEL = (mongoose_conn: typeof mongoose): Model<IIntegration> => mongoose_conn.model<IIntegration>(
    "music collection",
    INTEGRATIONS_SCHEMA(mongoose_conn),
    "music_integrations", 
    {
        overwriteModels: false,
    }
);

//TODO: consider storing collection names & db names as env variables