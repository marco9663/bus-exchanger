import { Badge, Center, Loader } from "@mantine/core";
import { INBOUND, OUTBOUND, getRouteList } from "@apis/kmb";
import React, { useState } from "react";

import { IconArrowBadgeRight } from "@tabler/icons";
import Link from "next/link";
import Loading from "./loading";
import { useQuery } from "@tanstack/react-query";

const Home: React.FC = () => {
    const [filter, setFilter] = useState("");
    const { isLoading, data, error } = useQuery({
        queryKey: ["getRouteList"],
        queryFn: getRouteList,
    });
    if (isLoading) return <Loading />;
    return (
        <div className="herestight">
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
                    data.data
                        .filter((route) => route.route.startsWith(filter))
                        .map((route) => (
                            <Link
                                href={`/route/${route.route}?direction=${
                                    route.bound == "I" ? INBOUND : OUTBOUND
                                }&service_type=${route.service_type}`}
                            >
                                <div
                                    key={route.route}
                                    className="flex items-center px-4 py-2 flex-wrap"
                                >
                                    <div className="font-bold w-16">
                                        {route.route}
                                    </div>

                                    <div className="flex">
                                        {/* <div className="w-44">{route.orig_tc}</div> */}
                                        {/* <IconArrowBadgeRight /> */}往
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
