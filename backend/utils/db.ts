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
    type: String,
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

export const INTEGRATION = (mongoose_conn: typeof mongoose): Model<IIntegration> => mongoose_conn.model<IIntegration>(
    "integration",
    INTEGRATIONS_SCHEMA(mongoose_conn),
    "integrations",
    {
        overwriteModels: false
    }
);
