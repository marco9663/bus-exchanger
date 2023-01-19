import { FC, Fragment, ReactNode, useCallback } from "react";
import { getRouteList } from "@apis";
import { db } from "../../../db";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../../pages/loading";
import JsSHA from "jssha";

const hashKey = "allRoute";

export const FirstLoad: FC<{ children: ReactNode }> = ({ children }) => {
    const getDBHashCache = useCallback(
        async (key: string) => {
            const data = await db.hash.get(key);
            return data?.value || null;
        },
        [db],
    );
    const { isLoading, error } = useQuery(["initialAllRoute"], async () => {
        const data = await getRouteList();
        const sha224 = new JsSHA("SHA-224", "BYTES");
        sha224.update(JSON.stringify(data.data));
        const routeListHash = sha224.getHash("HEX");
        if (routeListHash === (await getDBHashCache(hashKey))) return null;
        await db.kmbRouteTable.clear();
        await db.kmbRouteTable.bulkAdd(data.data);
        await db.hash.add({ id: hashKey, value: routeListHash });
        return null;
    });
    if (isLoading) return <Loading />;
    return <Fragment>{children}</Fragment>;
};
