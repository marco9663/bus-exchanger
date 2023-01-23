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
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { db, KMBRouteTable } from "../../../../db";
import { ActionIcon, Button, Modal, Select } from "@mantine/core";
import {
    getRouteStopWithName,
    KBMBoundType, KMBDirection,
    KMBRouteType,
    RouteStopWithName,
    toBound
} from "@apis";
import { IconPencil } from "@tabler/icons";

interface ItemProps extends ComponentPropsWithoutRef<"div"> {
    label: string;
}

const fillRouteList = (routeList?: KMBRouteType[]) =>
    routeList?.map((r) => ({
        ...r,
        label: `${r.route} 住${r.dest_tc} ${r.service_type}`,
        value: `${r.route}-${toBound[r.bound]}-${r.service_type}`,
    })) || [];

const fillRouteStop = (routeStop?: RouteStopWithName[]) =>
    routeStop?.map((s) => ({ ...s, label: s.name_tc, value: s.stop })) || [];

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
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

export const FirstRouteWidget: FC<ExchangeWidgetProps> = ({ index }) => {
    const { exchanges, handlers } = useExchange();
    const [opened, { close, open }] = useDisclosure(false);
    const [searchValue, setSearchValue] = useState<string>(
        exchanges[index].route_id.split("-")[0],
    );
    const [dValue] = useDebouncedValue(searchValue, 500);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(
        exchanges[index].route_id || null,
    );
    const [selectedStop, setSelectedStop] = useState<string | null>(
        exchanges[index].exchange_stop_id || null,
    );

    const handleSave = () => {
        if (selectedRoute?.split("-").length !== 3 || !selectedStop) {
            return;
        }
        const [route, bound, service_type] = selectedRoute?.split("-");
        handlers.setItem(index, {
            route_id: selectedRoute!,
            route: route,
            service_type: service_type,
            direction: bound as KMBDirection,
            exchange_stop_id: selectedStop,
        });
        close();
    };

    const { data: routeList } = useQuery({
        queryKey: ["routeList", dValue],
        queryFn: async () => {
            console.log("trigger route list search");
            if (dValue === "" || dValue.includes("-")) return [];
            return db.kmbRouteTable
                .where("route")
                .startsWithIgnoreCase(dValue)
                .toArray();
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
            return await getRouteStopWithName({
                route,
                service_type,
                direction: bound as KMBDirection,
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
                    label="Route"
                    placeholder="Pick one"
                    itemComponent={SelectItem}
                    data={fillRouteList(routeList)}
                    searchable
                    maxDropdownHeight={400}
                    value={selectedRoute}
                    onChange={setSelectedRoute}
                    onSearchChange={(v) => {
                        setSearchValue(v);
                    }}
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
