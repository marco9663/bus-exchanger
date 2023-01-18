import { INBOUND, OUTBOUND, getRouteList } from "@apis/kmb";
import React, { useEffect, useRef, useState } from "react";

import { Badge } from "@mantine/core";
import Link from "next/link";
import Loading from "./loading";
import { useCounter, useDebouncedValue, useIntersection } from "@mantine/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { db, KMBRouteTable } from "../db";

const getLink = (route: KMBRouteTable) =>
    `/route/${route.route}?direction=${
        route.bound == "I" ? INBOUND : OUTBOUND
    }&service_type=${route.service_type}`;

const Home: React.FC = () => {
    const [filter, setFilter] = useState("");
    const [debounced] = useDebouncedValue(filter, 200);
    const { isLoading, data } = useQuery({
        queryKey: ["DBGetRouteList", debounced],
        queryFn: async () => {
            console.log("start");
            if (debounced) {
                const data = await db.kmbRouteTable
                    .where("route")
                    .startsWith(debounced)
                    .toArray();
                return data;
            } else {
                const data = await db.kmbRouteTable.offset(20).limit(20).toArray();
                // console.log(data);
                return data;
            }
        },
    });
    if (isLoading) return <Loading />;
    return (
        <div className="rest-height">
            <div className="h-12 flex justify-center items-center text-3xl font-extrabold">
                Bus Exchanger
            </div>
            <div className="h-12">
                <input
                    className="w-full h-full text-center text-2xl "
                    placeholder="路線號碼"
                    value={filter}
                    onChange={(event) =>
                        setFilter(event.target.value.toUpperCase())
                    }
                />
            </div>
            <div className="h-[calc(100vh-3rem-6rem)] overflow-y-auto flex flex-col gap-2 divide-y divide-slate-400 dark:divide-slate-700">
                {data &&
                    data.map((route) => (
                        <Link
                            href={getLink(route)}
                            key={`${route.route}-${route.dest_en}-${route.service_type}`}
                        >
                            <div className="flex items-center px-4 py-2 flex-wrap">
                                <div className="font-bold w-16">
                                    {route.route}
                                </div>

                                <div className="flex">
                                    往
                                    <div className="font-bold pl-2">
                                        {route.dest_tc}
                                    </div>
                                </div>
                                <Badge>{route.service_type}</Badge>
                            </div>
                        </Link>
                    ))}
            </div>
        </div>
    );
};

export default Home;
