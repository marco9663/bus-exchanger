import { Autocomplete, SelectItemProps } from "@mantine/core";
import { FC, forwardRef } from "react";

import { getRouteList } from "@apis";
import { useQuery } from "@tanstack/react-query";

interface ItemProps extends SelectItemProps {
    route: string;
    destination: string;
    description: string;
}

const RouteSelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ description, value, route, destination, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <div>
                {value} {destination}
            </div>
            <div>{destination}</div>
            <div>{description}</div>
        </div>
    ),
);

const RouteSelect: FC = () => {
    const { isLoading, data, error } = useQuery({
        queryKey: ["getRouteList"],
        queryFn: getRouteList,
    });
    return (
        <Autocomplete
            label="Route"
            placeholder="Pick one"
            itemComponent={RouteSelectItem}
            data={
                data?.data.map((route) => ({ ...route, value: route.route })) ||
                []
            }
            filter={(value, item) => item.value.startsWith(value)}
        />
    );
};

export default RouteSelect;
