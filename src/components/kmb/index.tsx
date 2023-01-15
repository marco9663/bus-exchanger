import { FC, Fragment } from "react";

import Loading from "pages/loading";
import { getStop } from "@apis/kmb";
import { useQuery } from "@tanstack/react-query";

export type BusStopProps = {
    stop_id: string;
};

const BusStop: FC<BusStopProps> = ({ stop_id }) => {
    const { data, isLoading } = useQuery({
        queryKey: ["stop", stop_id],
        queryFn: () => getStop(stop_id),
    });
    if (isLoading) return <Loading />;
    return <Fragment>{data?.data.name_tc}</Fragment>;
};

export default BusStop;
