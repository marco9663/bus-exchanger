import { useExchange } from "../../../../pages/exchange";
import {
    ExchangeWidgetProps,
    RouteOption,
    StopOptions,
} from "@components/widget/exchange/types";
import { FC, Fragment, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import {
    ActionIcon,
    Button,
    Modal,
    useMantineColorScheme,
} from "@mantine/core";
import {
    getRouteStopWithName,
    getStopETA,
    KMBStopETA,
    RouteStopWithName,
    toBound,
} from "@apis";
import { IconPencil } from "@tabler/icons";
import Select from "react-select";
import {
    formRouteValue,
    formStopValue,
    styleConfig,
} from "@components/widget/exchange/utils";

const fillRouteList = (routeList?: KMBStopETA[]): RouteOption[] =>
    routeList?.map((r) => ({
        route: r.route,
        service_type: r.service_type.toString(),
        direction: toBound[r.dir],
        label: `${r.route} 住${r.dest_tc} ${r.service_type}`,
        value: `${r.route}-${toBound[r.dir]}-${r.service_type}`,
        route_dest: r.dest_tc,
    })) || [];

const fillRouteStop = (routeStop?: RouteStopWithName[]): StopOptions[] =>
    routeStop?.map((s) => ({ ...s, label: s.name_tc, value: s.stop })) || [];

export const ExchangeRouteWidget: FC<ExchangeWidgetProps> = ({ index }) => {
    const { colorScheme } = useMantineColorScheme();
    const { exchanges, handlers } = useExchange();
    const [opened, { close, open }] = useDisclosure(false);
    const [selectedRoute, setSelectedRoute] = useState<RouteOption>(
        formRouteValue(exchanges[index]),
    );
    const [selectedStop, setSelectedStop] = useState<StopOptions>(
        formStopValue(exchanges[index]),
    );

    const previousRoute = exchanges[index - 1];

    const handleSave = () => {
        console.log(selectedRoute, selectedStop);
        if (!selectedRoute || !selectedStop) return;
        handlers.setItem(index, {
            route_id: selectedRoute.value,
            route: selectedRoute.route,
            service_type: selectedRoute.service_type,
            direction: selectedRoute.direction,
            exchange_stop_id: selectedStop.value,
            route_dest: selectedRoute.route_dest,
            exchange_stop_name: selectedStop.label,
        });
        close();
    };

    const { data: routeList } = useQuery({
        queryKey: ["routeListETA"],
        queryFn: async () => {
            if (!previousRoute.exchange_stop_id) {
                return [];
            }
            console.log("trigger route ETA query");
            const data = await getStopETA(previousRoute.exchange_stop_id);
            return data.data;
        },
    });

    const { data: stopList } = useQuery({
        queryKey: ["routeStop", selectedRoute ? selectedRoute.value : ""],
        queryFn: async () => {
            console.log("trigger Stop Query");
            if (
                !selectedRoute ||
                !selectedRoute.route ||
                !selectedRoute.service_type ||
                !selectedRoute.direction
            )
                return null;
            return await getRouteStopWithName({
                route: selectedRoute.route,
                service_type: selectedRoute.service_type,
                direction: selectedRoute.direction,
            });
        },
        enabled: !!selectedRoute,
    });

    return (
        <Fragment>
            <Modal
                opened={opened}
                onClose={close}
                title="Find Route and Station for exchange"
            >
                <Select
                    styles={styleConfig(colorScheme)}
                    value={selectedRoute}
                    onChange={(newValue) =>
                        newValue && setSelectedRoute(newValue)
                    }
                    options={fillRouteList(routeList)}
                />

                <Select
                    styles={styleConfig(colorScheme)}
                    value={selectedStop}
                    onChange={(newValue) =>
                        newValue && setSelectedStop(newValue)
                    }
                    options={fillRouteStop(stopList || [])}
                />
                <div className="flex justify-center mt-4">
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </Modal>
            <ActionIcon onClick={open}>
                <IconPencil />
            </ActionIcon>
        </Fragment>
    );
};
