import { getStopWithCache, KMBDirection, KMBRouteStop } from "./index";

import { getRouteStop } from "@apis/kmb";

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
    const promises = stops.data.map((stop) => getStopWithCache(stop.stop));
    // order is preserved
    const stopsWithCache = await Promise.all(promises);
    return stops.data.map((stop, i) => ({
        ...stop,
        name_en: stopsWithCache[i].name_en,
        name_sc: stopsWithCache[i].name_sc,
        name_tc: stopsWithCache[i].name_tc,
    }));
};
