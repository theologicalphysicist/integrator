import "cross-fetch/polyfill";
import { Client, AuthenticationProvider, ClientOptions } from "@microsoft/microsoft-graph-client";

class IntegratorAuthProvider implements AuthenticationProvider {
	/**
	 * This method will get called before every request to the msgraph server
	 * This should return a Promise that resolves to an accessToken (in case of success) or rejects with error (in case of failure)
	 * Basically this method will contain the implementation for getting and refreshing accessTokens
	 */
    public async getAccessToken(): Promise<string> {
        if (process.env.MICROSOFT_CLIENT_ID) {
            return process.env.MICROSOFT_CLIENT_ID;
        } else {
            return "";
        }
    };
}

const clientOptions: ClientOptions = {
    authProvider: new IntegratorAuthProvider(),
};

const MICROSOFT_CLIENT: Client = Client.initWithMiddleware(clientOptions);

export const TodoFetch = async () => {
    let data: any = "";
    try {
        const MY_DETAILS: any = await MICROSOFT_CLIENT.api("/me").get();
        console.log(MY_DETAILS);
        data = MY_DETAILS;
    } catch (err) {
        console.error(err);
        data = err;
    }
    return data;
}