import { KMBDirection, KMBRouteStop, getStop } from "./index";

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
    const newStops: RouteStopWithName[] = [];
    for (const stop of stops.data) {
        const { data } = await getStop(stop.stop);
        newStops.push({
            ...stop,
            name_en: data.name_en,
            name_sc: data.name_sc,
            name_tc: data.name_tc,
        });
    }
    return newStops;
};
