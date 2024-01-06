import mongoose, {Model, Schema, Document} from "mongoose";

//_ LOCAL
import { MONGODB_URL } from "../utils/const.js";
import { DatabaseResponse, ErrorResponse, Framework, GeneralResponse, IIntegration, ModifierQuery, ReadQuery } from "utils/types.js";
import { wrapResponse } from "utils/func.js";
import { Verbal } from "utils/logger.js";


// mongoose.connect(
//     MONGODB_URL(process.env.MONGODB_USER, process.env.MONGODB_PASSWORD), 
//     {
//         dbName: "sessions",
//     }
// );

const MONGOOSE_LOGGER: Verbal = new Verbal("MONGOOSE", true, Framework.EXPRESS);


//_ FUNCTIONS
export async function find({query, model}: ReadQuery, query_id?: string) { //* figure out the types for the model
    
    if (query_id) { //* id passed because you only want one document
        const MONGOOSE_RES: IIntegration | null = await model.findById(
            query_id,
            {},
            {lean: true}
        ).exec();

        return {
            document: MONGOOSE_RES ?? null,
            count: MONGOOSE_RES ? 1 : 0,
            exists: Boolean(MONGOOSE_RES)
        }
    } else { //* will return a list of documents
        const MONGOOSE_RES: (IIntegration | null)[] = await model.find(
            query.toObject!(),
            {},
            {lean: true}
        ).exec();

        return {
            document: MONGOOSE_RES ?? null,
            count: MONGOOSE_RES ? MONGOOSE_RES.length : 0,
            exists: Boolean(MONGOOSE_RES)
        };
    };

};


export async function check({query, model}: ReadQuery) {
    const MONGOOSE_RES: {_id: string} | null = await model.exists(query.toObject!()).exec();

    return {
        exists: Boolean(MONGOOSE_RES),
        count: MONGOOSE_RES ? 1 : 0,
    };
};


export async function create({document, model}: ModifierQuery) {
    let database_response: DatabaseResponse = {
        result: false
    };

    await document.save!({
        validateBeforeSave: true,
        checkKeys: true,
    }).then((current_document: IIntegration) => {
        MONGOOSE_LOGGER.log(current_document);

        database_response.document = current_document;

    }).catch((mongoose_err: any) => {
        MONGOOSE_LOGGER.error(mongoose_err);

        database_response.message = JSON.stringify(mongoose_err);

    });

    return database_response;
};


export async function update({document, model, documentID}: ModifierQuery) {
    let database_response: DatabaseResponse = {
        result: false
    };


    if (documentID) {

        await model.findByIdAndUpdate(
            documentID,
            document,
            {
                lean: true
            }
        )
    } else if (document && model) {

        model.findOneAndUpdate(document.toObject!(), )

    } else {
        MONGOOSE_LOGGER.error("invalid parameters provided");

        database_response.message = JSON.stringify("invalid parameters provided");
    }
    
}