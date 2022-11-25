var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "cross-fetch/polyfill";
import { Client } from "@microsoft/microsoft-graph-client";
class IntegratorAuthProvider {
    /**
     * This method will get called before every request to the msgraph server
     * This should return a Promise that resolves to an accessToken (in case of success) or rejects with error (in case of failure)
     * Basically this method will contain the implementation for getting and refreshing accessTokens
     */
    getAccessToken() {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.env.MICROSOFT_CLIENT_ID) {
                return process.env.MICROSOFT_CLIENT_ID;
            }
            else {
                return "";
            }
        });
    }
    ;
}
const clientOptions = {
    authProvider: new IntegratorAuthProvider(),
};
const MICROSOFT_CLIENT = Client.initWithMiddleware(clientOptions);
export const TodoFetch = () => __awaiter(void 0, void 0, void 0, function* () {
    let data = "";
    try {
        const MY_DETAILS = yield MICROSOFT_CLIENT.api("/me").get();
        console.log(MY_DETAILS);
        data = MY_DETAILS;
    }
    catch (err) {
        console.error(err);
        data = err;
    }
    return data;
});
//# sourceMappingURL=microsoft_todo.js.map