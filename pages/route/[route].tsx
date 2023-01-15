import "dayjs/locale/zh-hk";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";

import { FC, useEffect, useState } from "react";
import {
    KMBDirection,
    boundMap,
    getRouteETA,
    getRouteStop,
    getStop,
} from "@apis/kmb";
import { useInterval, useToggle } from "@mantine/hooks";
import { useQueries, useQuery } from "@tanstack/react-query";

import BusStop from "@components/kmb";
import Error from "next/error";
import { Loader } from "@mantine/core";
import Loading from "pages/loading";
import Page404 from "pages/404";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";

dayjs.extend(relativeTime);
dayjs.locale("zh-hk");

type QueryParam = {
    route: string;
    direction: KMBDirection;
    service_type: string;
};

const Route: FC = () => {
    const router = useRouter();
    const { direction, route, service_type = "1" } = router.query as QueryParam;
    if (!direction || !route) return <Page404 />;

    const [bool, toggle] = useToggle([true, false]);
    const interval = useInterval(() => toggle(), 1000);
    useEffect(() => {
        interval.start();
        return interval.stop;
    }, []);

    const {
        data: routeStopData,
        error: routeStopError,
        isLoading: routeStopLoading,
    } = useQuery({
        queryKey: ["routeStop", direction, route, service_type],
        queryFn: () => getRouteStop({ direction, route, service_type }),
    });
    const {
        data: routeETAData,
        error: routeETAError,
        isLoading: routeETA,
    } = useQuery({
        queryKey: ["routeETA", route, service_type],
        queryFn: () => getRouteETA({ route, service_type }),
        // staleTime: 0,
    });
    if (routeStopLoading || routeETA) return <Loading />;

    // const busStopQueries = useQueries({
    //     queries: routeStopData!.data.map((stop) => {
    //         return {
    //             queryKey: ["stop", stop.stop],
    //             queryFn: () => getStop(stop.stop),
    //             enabled: !!routeStopData,
    //         };
    //     }),
    // });
    // busStopQueries.

    return (
        <div className="rest-height">
            <div className="flex justify-center items-center font-bold text-xl h-12 bg-blue-300 dark:bg-blue-600">
                {route}
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto h-[calc(100vh-3rem-3rem)] divide-y divide-zinc-300">
                {routeStopData?.data.map((stop, index) => {
                    return (
                        <div className="flex justify-between items-center px-2">
                            <BusStop stop_id={stop.stop} />
                            <div>
                                {routeETAData?.data
                                    .filter(
                                        (routeETA) =>
                                            routeETA.seq === index + 1 &&
                                            direction ===
                                                boundMap(routeETA.dir),
                                    )
                                    .map((routeETA) => {
                                        const eta = dayjs(routeETA.eta);
                                        return (
                                            <div>
                                                {eta.isAfter(new Date()) &&
                                                    eta.fromNow(true) + "後"}
                                            </div>
                                        );
                                    })}
                                {/* .map((routeETA) => (
                                        <div>
                                            {dayjs(routeETA.eta).fromNow(true)}
                                        </div>
                                    ))} */}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Route;
