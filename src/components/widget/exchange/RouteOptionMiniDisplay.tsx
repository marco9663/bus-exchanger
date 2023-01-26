import React, { FC, Fragment } from "react";
import { RouteOption } from "@components/widget/exchange/types";
import { useQuery } from "@tanstack/react-query";
import { db } from "../../../../db";
import { toBoundSF } from "@apis";

export type RouteOptionMiniDisplayProps = {
    routeOption: RouteOption;

};

export const RouteOptionMiniDisplay: FC<RouteOptionMiniDisplayProps> = ({
    routeOption,
}) => {
    const { data: route, isLoading } = useQuery({
        queryKey: [
            "route",
            routeOption.route,
            routeOption.direction,
            routeOption.service_type,
        ],
        queryFn: async () => {
            const data = await db.kmbRouteTable
                .where("[route+bound+service_type]")
                .equals([
                    routeOption.route,
                    toBoundSF[routeOption.direction],
                    routeOption.service_type,
                ])
                .first();
            return data;
        },
    });
    return (
        <div className="text-sm text-center">
            {!isLoading && route && (
                <Fragment>
                    <div className="font-bold"> {route.route}</div>
                    <div className="text-xs">{route.dest_tc}</div>
                </Fragment>
            )}
        </div>
    );
};
