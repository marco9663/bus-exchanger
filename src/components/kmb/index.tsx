import { FC, Fragment } from "react";
import { KMBDirection, getRoute, getStop, getStopWithCache } from "@apis/kmb";

import { Loader } from "@mantine/core";
import Loading from "pages/loading";
import { useQuery } from "@tanstack/react-query";

export type BusStopProps = {
    stop_id: string;
};

export const BusStop: FC<BusStopProps> = ({ stop_id }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["stop", stop_id],
        queryFn: () => getStopWithCache(stop_id),
    });
    if (isLoading) return <Loading />;
    return <Fragment>{data?.name_tc}</Fragment>;
};

export type RouteProps = {
    direction: KMBDirection;
    route: string;
    service_type: string;
};

export const Route: FC<RouteProps> = ({ route, direction, service_type }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["route", route, direction, service_type],
        queryFn: async () => {
            return await getRoute({ route, direction, service_type });
        },
        enabled: !!route && !!direction && !!service_type,
    });
    // if (isLoading)
    //     return (
    //         <>
    //             <Loader />
    //         </>
    //     );
    return (
        <div className="grid grid-cols-2 gap-x-2">
            <div className="text-sm font-bold">路線</div>
            <div className="text-sm font-bold">目的地</div>
            {isLoading ? (
                <div className="text-neutral-500">未選擇</div>
            ) : (
                data && data.data && <div>{route}</div>
            )}
            {isLoading ? (
                <div className="text-neutral-500">未選擇</div>
            ) : (
                data && data.data && <div>住{data?.data.dest_tc}</div>
            )}
        </div>
    );
};
