import { Db, MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

// Collection
export type Cache = {
    key: string;
    hash: string;
};

let cachedDb: Db;
const client = new MongoClient(process.env.APP_MONGO_DB!);

export interface NextApiRequestExtended extends NextApiRequest {
    db: Db;
    dbClient: MongoClient;
}

export async function middleware(
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
        console.log(cachedDb.listCollections());
        req.dbClient = client;
        req.db = cachedDb;
        return next();
    } catch (error) {
        console.log("ERROR aquiring DB Connection!");
        console.log(error);
        throw error;
    }
}

export default middleware;
export const config = {
    matcher: "/api/:function*",
};
