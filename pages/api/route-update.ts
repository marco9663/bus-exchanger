import { NextApiResponse } from "next";
import { getRouteList } from "@apis";
import JsSHA from "jssha";
import { Cache, NextApiRequestExtended } from "./middleware";

type RouteUpdateBody = {
    hash: string;
};

export default async (req: NextApiRequestExtended, res: NextApiResponse) => {
    let routeListHash: string;

    const { hash } = req.query as RouteUpdateBody;

    const cachedData = await req.db
        .collection<Cache>("cache")
        .findOne({ key: "allRouteList" });
    routeListHash = cachedData?.hash || "";
    if (!cachedData) {
        const data = await getRouteList();
        const sha224 = new JsSHA("SHA-224", "BYTES");
        sha224.update(JSON.stringify(data.data));
        routeListHash = sha224.getHash("HEX");
    }
    if (hash !== routeListHash)
        if (!cachedData) {
            return res.status(200).json({
                upToDate: false,
            });
        }
    return res.status(200).json({
        upToDate: true,
    });
};
