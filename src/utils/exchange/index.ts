import dayjs, { Dayjs } from "dayjs";
import { KMBRouteETA } from "@apis";

export type FindNextBusParams = {
    eta: KMBRouteETA[];
    atTime?: Dayjs;
};

export const findNextBus = ({ eta, atTime = dayjs() }: FindNextBusParams) => {
    let nextbus: KMBRouteETA | null = null;
    eta.sort((a, b) => (dayjs(a.eta).isAfter(b.eta) ? 1 : -1)).forEach(
        (value) => {
            if (dayjs(value.eta).diff(atTime) > 0) {
                nextbus = value;
            }
        },
    );
    if (!nextbus) {
        throw new Error("no next bus");
    }
    return nextbus;
};
