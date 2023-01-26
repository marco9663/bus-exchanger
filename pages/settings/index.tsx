import ColorToggle from "@components/button/ColorToggle";
import { FC, useCallback } from "react";
import { IconRefresh } from "@tabler/icons";
import { ActionIcon } from "@mantine/core";
import { getRouteList } from "@apis";
import JsSHA from "jssha";
import { db, routeListHashKey } from "../../db";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

const Settings: FC = () => {
    const { data: routeListHash, refetch } = useQuery({
        queryKey: ["routeLastUpdateAt"],
        queryFn: async () => {
            return db.hash.get(routeListHashKey);
        },
    });
    const refreshRouteList = useCallback(async () => {
        const data = await getRouteList();
        const sha224 = new JsSHA("SHA-224", "BYTES");
        sha224.update(JSON.stringify(data.data));
        const routeListHash = sha224.getHash("HEX");
        await db.kmbRouteTable.clear();
        await db.kmbRouteTable.bulkAdd(data.data);
        await db.hash.put({
            id: routeListHashKey,
            value: routeListHash,
            updateAt: new Date(),
        });
        await refetch();
    }, [db]);
    return (
        <div className="flex flex-col items-center px-4 rest-height">
            <h1>Settings</h1>
            <div className="flex items-center justify-between w-full">
                <p className="font-bold text-xl">Dark Mode</p>
                <ColorToggle />
            </div>
            <div className="flex items-center justify-between w-full">
                <div>
                    <p className="font-bold text-xl">Update Route List</p>
                    <div className="text-xs">
                        last update:{" "}
                        {routeListHash
                            ? dayjs(routeListHash.updateAt).format(
                                  "YYYY-MM-DD HH:mm:ss",
                              )
                            : "null"}
                    </div>
                </div>
                <ActionIcon
                    variant="transparent"
                    title="Toggle color scheme"
                    size="xl"
                    onClick={refreshRouteList}
                >
                    <IconRefresh />
                </ActionIcon>
            </div>
        </div>
    );
};

export default Settings;
