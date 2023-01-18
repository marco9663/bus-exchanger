import { INBOUND, OUTBOUND, getRouteList } from "@apis/kmb";
import React, { useEffect, useRef, useState } from "react";

import { Badge } from "@mantine/core";
import Link from "next/link";
import Loading from "./loading";
import { useCounter, useDebouncedValue, useIntersection } from "@mantine/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { db } from "../db";

const Home: React.FC = () => {
    const [filter, setFilter] = useState("");
    const [debounced] = useDebouncedValue(filter, 500);
    const containerRef = useRef(null);
    const { ref, entry } = useIntersection({
        root: containerRef.current,
        threshold: 1,
    });
    const { isLoading, data, fetchNextPage } = useInfiniteQuery({
        queryKey: ["DBGetRouteList"],
        queryFn: async ({ pageParam = 20 }) => {
            if (debounced) {
                const data = await db.kmbRouteTable
                    .where("route")
                    .startsWith(debounced)
                    .limit(20)
                    .offset(pageParam)
                    .toArray();
                return data;
            } else {
                const data = await db.kmbRouteTable
                    .limit(20)
                    .offset(pageParam)
                    .toArray();
                console.log(data);
                return data;
            }
        },
        getNextPageParam: (lastPage, allPages) => {
            return allPages.length * 20 + 20;
        },
    });
    useEffect(() => {
        if (entry && entry.isIntersecting) {
            fetchNextPage().then(() => {});
        }
    }, [entry]);
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
            <div
                ref={containerRef}
                className="h-[calc(100vh-3rem-6rem)] overflow-y-auto flex flex-col gap-2 divide-y divide-slate-400 dark:divide-slate-700"
            >
                {data &&
                    data.pages.map((page, pageNum) =>
                        page.map((route, itemNum) => (
                            <Link
                                ref={
                                    pageNum === data.pages.length + 1 &&
                                    page.length - itemNum < 8
                                        ? ref
                                        : null
                                }
                                href={`/route/${route.route}?direction=${
                                    route.bound == "I" ? INBOUND : OUTBOUND
                                }&service_type=${route.service_type}`}
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
                        )),
                    )}
            </div>
        </div>
    );
};

export default Home;
