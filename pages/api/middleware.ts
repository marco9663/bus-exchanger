import { Db, MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

// Collection
export type Cache = {
    key: string;
    hash: string;
};

let cachedDb: Db;
const client = new MongoClient(process.env.APP_MONGO_DB!);

export interface NextApiRequestExtended<T = void> extends NextApiRequest {
    db: Db;
    dbClient: MongoClient;
}

async function database(
    req: NextApiRequestExtended,
    res: NextApiResponse,
    next: any,
) {
    if (cachedDb) {
        console.log("Existing cached connection found!");
        return cachedDb;
    }
    console.log("Aquiring new DB connection....");
    try {
        // Specify which database we want to use
        const db = await client.db("public");

        cachedDb = db;
        req.dbClient = client;
        req.db = client.db("MCT");
        return next();
    } catch (error) {
        console.log("ERROR aquiring DB Connection!");
        console.log(error);
        throw error;
    }
}

export default database;
