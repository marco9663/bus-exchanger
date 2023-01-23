import { useExchange } from "../../../../pages/exchange";
import { ExchangeWidgetProps } from "@components/widget/exchange/types";
import {
    ComponentPropsWithoutRef,
    FC,
    forwardRef,
    Fragment,
    useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import { ActionIcon, Button, Modal, Select, SelectItem } from "@mantine/core";
import {
    boundMap,
    getRouteStopWithName,
    getStopETA,
    INBOUND,
    KBMBoundType,
    KMBDirection,
    KMBRouteType,
    KMBStopETA,
    OUTBOUND,
    RouteStopWithName,
    toBound, toBoundSF
} from "@apis";
import { IconPencil } from "@tabler/icons";

interface ItemProps extends ComponentPropsWithoutRef<"div"> {
    label: string;
}

const fillRouteList = (routeList?: KMBStopETA[]) =>
    routeList?.map((r) => ({
        ...r,
        label: `${r.route} 住${r.dest_tc} ${r.service_type}`,
        value: `${r.route}-${toBound[r.dir]}-${r.service_type}`,
    })) || [];

const fillRouteStop = (routeStop?: RouteStopWithName[]) =>
    routeStop?.map((s) => ({ ...s, label: s.name_tc, value: s.stop })) || [];

const SelectItem2 = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <div>{label}</div>
        </div>
    ),
);
const SelectStopItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ label, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others}>
            <div>{label}</div>
        </div>
    ),
);

export const ExchangeRouteWidget: FC<ExchangeWidgetProps> = ({ index }) => {
    const { exchanges, handlers } = useExchange();
    const [opened, { close, open }] = useDisclosure(false);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
    const [selectedStop, setSelectedStop] = useState<string | null>(null);

    const previousRoute = exchanges[index - 1];

    const handleSave = () => {
        console.log(selectedRoute, selectedStop);
        if (selectedRoute?.split("-").length !== 3 || !selectedStop) {
            return;
        }
        const [route, bound, service_type] = selectedRoute?.split("-");
        const data = {
            route_id: selectedRoute!,
            route: route,
            service_type: service_type,
            direction: bound,
            exchange_stop_id: selectedStop,
        };
        console.log(data);
        handlers.setItem(index, data as any);
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
        queryKey: ["routeStop", selectedRoute],
        queryFn: async () => {
            console.log("trigger Stop Query");
            if (selectedRoute?.split("-").length !== 3) {
                return [];
            }
            const [route, bound, service_type] = selectedRoute?.split("-");
            console.log(route, bound, service_type);
            return await getRouteStopWithName({
                route,
                service_type,
                direction: bound as any,
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
                    label="Exchange Route"
                    placeholder="Pick one Exchange Route"
                    itemComponent={SelectItem2}
                    data={fillRouteList(routeList)}
                    maxDropdownHeight={400}
                    value={selectedRoute}
                    onChange={setSelectedRoute}
                />

                <Select
                    label="Stop"
                    placeholder="Pick one"
                    itemComponent={SelectStopItem}
                    data={fillRouteStop(stopList)}
                    maxDropdownHeight={400}
                    value={selectedStop}
                    onChange={setSelectedStop}
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
