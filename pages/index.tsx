import { INBOUND, OUTBOUND, getRouteList } from "@apis/kmb";
import React, { Fragment, useEffect, useRef, useState } from "react";

import { Badge, Loader } from "@mantine/core";
import Link from "next/link";
import Loading from "./loading";
import { useCounter, useDebouncedValue, useIntersection } from "@mantine/hooks";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { db, KMBRouteTable } from "../db";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const getLink = (route: KMBRouteTable) =>
    `/route/${route.route}?direction=${
        route.bound == "I" ? INBOUND : OUTBOUND
    }&service_type=${route.service_type}`;

const itemPerPage = 40;

const Home: React.FC = () => {
    const [filter, setFilter] = useState("");
    const [debounced] = useDebouncedValue(filter, 300);
    const containerRef = useRef(null);
    const { isLoading, data, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ["DBGetRouteList", debounced],
        queryFn: async ({ pageParam = 0 }) => {
            if (debounced) {
                const data = await db.kmbRouteTable
                    .where("route")
                    .startsWith(debounced)
                    .offset(pageParam)
                    .limit(itemPerPage)
                    .toArray();
                const total = await db.kmbRouteTable
                    .where("route")
                    .startsWith(debounced)
                    .count();
                return { total: total, data: data, count: data.length };
            } else {
                const data = await db.kmbRouteTable
                    .offset(pageParam)
                    .limit(itemPerPage)
                    .toArray();
                const total = await db.kmbRouteTable.count();
                return { total: total, data: data, count: data.length };
            }
        },
        getNextPageParam: (lastPage, allPages) => {
            const total = lastPage.total;

            return (
                allPages.flat(1).length <= total &&
                allPages.length * itemPerPage + itemPerPage
            );
        },
    });

    const count = data
        ? data.pages.reduce(
              (accumulator, current) => accumulator + current.count,
              0,
          )
        : 0;

    const itemCount = hasNextPage ? count + 1 : count;

    const isItemLoaded = (index: number) => !hasNextPage || index < count;

    const Item = ({ index, style }: { index: number; style: any }) => {
        const route = data?.pages.map((d) => d.data).flat(1)[index];

        return (
            <Fragment>
                {route && (
                    <Link
                        style={style}
                        href={getLink(route)}
                        key={`${route.route}-${route.dest_en}-${route.service_type}`}
                    >
                        <div
                            className={`flex items-center px-4 py-2 flex-wrap 
                            ${
                                index !== 0
                                    ? "border-t border-t-neutral-600"
                                    : ""
                            }
                            `}
                        >
                            <div className="font-bold w-16">{route.route}</div>

                            <div className="flex">
                                往
                                <div className="font-bold pl-2">
                                    {route.dest_tc}
                                </div>
                            </div>
                            <Badge>{route.service_type}</Badge>
                        </div>
                    </Link>
                )}
            </Fragment>
        );
    };

    if (isLoading) return <Loading />;
    return (
        <div className="rest-height">
            <div className="h-12 flex justify-center items-center text-3xl font-extrabold">
                Bus Exchanger
            </div>
            <div className="h-12">
                <input
                    autoFocus
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
                className="h-[calc(100vh-3rem-6rem)] overflow-y-auto flex flex-col gap-2 "
            >
                <AutoSizer>
                    {({ height, width }) => (
                        <InfiniteLoader
                            isItemLoaded={isItemLoaded}
                            itemCount={itemCount}
                            loadMoreItems={async (startIndex, stopIndex) => {
                                await fetchNextPage();
                            }}
                        >
                            {({ onItemsRendered, ref }) => (
                                <FixedSizeList
                                    itemCount={itemCount}
                                    onItemsRendered={onItemsRendered}
                                    ref={ref}
                                    itemSize={50}
                                    height={height}
                                    width={width}
                                >
                                    {Item}
                                </FixedSizeList>
                            )}
                        </InfiniteLoader>
                    )}
                </AutoSizer>
            </div>
        </div>
    );
};

export default Home;
