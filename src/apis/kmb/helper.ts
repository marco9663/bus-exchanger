import { KMBDirection, KMBRouteStop, getStop, getStopWithCache } from "./index";

import { getRouteStop } from "@apis/kmb";
import { db } from "../../../db";

export type getRouteStopWithNameParam = {
    route: string;
    direction: KMBDirection;
    service_type: string;
};

export type RouteStopWithName = KMBRouteStop & {
    name_en: string;
    name_tc: string;
    name_sc: string;
};

export const getRouteStopWithName = async (
    param: getRouteStopWithNameParam,
): Promise<RouteStopWithName[]> => {
    const stops = await getRouteStop(param);
    const newStops: RouteStopWithName[] = [];
    for (const stop of stops.data) {
        const found = await db.kmbStopTable.get(stop.stop);
        if (found) {
            newStops.push({
                ...stop,
                name_en: found.name_en,
                name_sc: found.name_sc,
                name_tc: found.name_tc,
            });
            continue;
        }
        const data = await getStopWithCache(stop.stop);
        newStops.push({
            ...stop,
            name_en: data.name_en,
            name_sc: data.name_sc,
            name_tc: data.name_tc,
        });
        await db.kmbStopTable.add({
            stop: stop.stop,
            name_en: data.name_en,
            name_sc: data.name_sc,
            name_tc: data.name_tc,
            lat: data.lat,
            long: data.long,
        });
    }
    return newStops;
};
