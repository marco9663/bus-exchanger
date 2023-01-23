import { NextApiResponse } from "next";
import { getRouteList } from "@apis";
import JsSHA from "jssha";
import { Cache, NextApiRequestExtended } from "./middleware";

type RouteUpdateBody = {
    hash: string;
};

export default async (
    req: NextApiRequestExtended<RouteUpdateBody>,
    res: NextApiResponse,
) => {
    const data = await getRouteList();
    const sha224 = new JsSHA("SHA-224", "BYTES");
    sha224.update(JSON.stringify(data.data));
    const routeListHash = sha224.getHash("HEX");
    const cachedData = await req.db
        .collection<Cache>("cache")
        .findOne({ key: "allRouteList", hash: routeListHash });
    if (!cachedData) {
        return res.status(200).json({
            upToDate: false,
        });
    }
    return res.status(200).json({
        upToDate: true,
    });
};
