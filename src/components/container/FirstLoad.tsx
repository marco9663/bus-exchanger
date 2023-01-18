import { FC, Fragment, ReactNode } from "react";
import { getRouteList } from "@apis";
import { db } from "../../../db";
import { useQuery } from "@tanstack/react-query";

export const FirstLoad: FC<{ children: ReactNode }> = ({ children }) => {
    const { isLoading, error } = useQuery(["initialAllRoute"], async () => {
        const data = await getRouteList();
        console.log(data.data.length);
        console.log(await db.kmbRouteTable.count());
        if (data.data.length !== (await db.kmbRouteTable.count())) {
            await db.kmbRouteTable.clear();
            await db.kmbRouteTable.bulkAdd(data.data);
        }
        return null;
    });
    return <Fragment>{children}</Fragment>;
};
