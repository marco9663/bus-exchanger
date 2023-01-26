import {
    ActionIcon,
    Button,
    Modal,
    Select,
    SelectItemProps,
} from "@mantine/core";
import { FC, forwardRef, Fragment, useState } from "react";
import {
    boundMap,
    getRouteList,
    getRouteStopWithName,
    getStopETA,
    KMBDirection,
    KMBRouteType,
    toBound,
} from "@apis/kmb";

import { IconPencil } from "@tabler/icons";
import { useExchange } from "pages/exchange";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue, useToggle } from "@mantine/hooks";
import { db, KMBRouteTable } from "../../../db";

export type ExchangeWidgetProps = {
    index: number;
};

export type Route = {
    value: string;
    label: string;
} & KMBRouteType;

type ItemProps = Route & SelectItemProps;

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ value, route, dest_tc, service_type, ...others }: ItemProps, ref) => (
        <div ref={ref} {...others} className="flex">
            <div className="w-12">{route}</div>
            <div>
                住{dest_tc} ({service_type})
            </div>
        </div>
    ),
);

const ExchangeWidget: FC<ExchangeWidgetProps> = ({ index }) => {
    const { exchanges, handlers } = useExchange();
    const [opened, toggle] = useToggle([false, true]);
    const [stop, setStop] = useState<string | null>(null);
    const [route, setRoute] = useState<Route | null>(
        exchanges[index].route_id || null,
    );
    const [exchange, setExchange] = useState<Route[]>([]);
    const [searchValue, onSearchChange] = useState("");
    const [dSearchValue] = useDebouncedValue(searchValue, 300);

    const handleSave = () => {
        if (route && stop) {
            handlers.setItem(index, {
                route: route.route,
                service_type: route.service_type,
                exchange_stop_id: stop,
                direction: boundMap(route.bound),
                route_id: route.value,
            });
        } else {
            console.log("Please select");
        }
        toggle();
    };

    const { data: routes = [] } = useQuery({
        queryKey: ["DBGetRouteList", dSearchValue],
        queryFn: async () => {
            let data: KMBRouteTable[] = [];
            if (dSearchValue) {
                data = await db.kmbRouteTable
                    .where("route")
                    .startsWith(dSearchValue)
                    .toArray();
            } else {
                data = await db.kmbRouteTable.toArray();
            }
            const res: Route[] = data.map((r) => ({
                ...r,
                label: `${r.route} 住${r.dest_tc} ${r.service_type}`,
                value: `${r.route}-${r.bound}-${r.service_type}`,
            }));
            return res;
        },
        refetchOnWindowFocus: false,
    });
    const { data: stopData } = useQuery({
        queryKey: route
            ? [
                  "getRouteStopWithName",
                  boundMap(route.bound),
                  route.route,
                  route.service_type,
              ]
            : [],
        queryFn: () =>
            getRouteStopWithName({
                direction: boundMap(route!.bound) as KMBDirection,
                route: route!.route,
                service_type: route!.service_type,
            }),
        enabled: !!route,
        refetchOnWindowFocus: false,
    });
    const handleRouteChange = (routeId: string) => {
        setRoute(
            [...routes, ...exchange].find(
                (r) => `${r.route}-${r.bound}-${r.service_type}` === routeId,
            ) || null,
        );
        setStop("");
    };
    const previousExchangeStop = exchanges[index - 1]?.exchange_stop_id || "";
    const {} = useQuery({
        queryKey: ["stopETA", previousExchangeStop],
        queryFn: async () => {
            const data = await getStopETA(previousExchangeStop);
            return db.kmbRouteTable
                .where("[route+bound+service_type]")
                .anyOf(
                    ...data.data.map((d) => [d.route, d.dir, d.service_type]),
                )
                .toArray();
        },
        enabled: index > 0 && !!exchanges[index - 1].exchange_stop_id,
        onSuccess(data) {
            console.log(data);
            const res = data.map((e) => {
                return {
                    bound: e.bound,
                    value: e.id!.toString(),
                    label: e.route,
                    route: e.route,
                    dest_tc: e.dest_tc,
                    dest_en: e.dest_en,
                    dest_sc: e.dest_sc,
                    orig_en: "",
                    orig_sc: "",
                    orig_tc: "",
                    service_type: e.service_type.toString(),
                };
            });
            console.log(res);
            setExchange(res);
        },
    });
    return (
        <Fragment>
            <Modal
                opened={opened}
                onClose={() => toggle(false)}
                title="Find Route and Station for exchange"
            >
                <Select
                    label="Route"
                    placeholder="Route"
                    searchable
                    itemComponent={SelectItem}
                    nothingFound="No options"
                    maxDropdownHeight={280}
                    data={index > 0 ? exchange : routes}
                    value={route?.value}
                    onChange={handleRouteChange}
                    clearable
                    searchValue={searchValue}
                    onSearchChange={(v) => onSearchChange(v.toUpperCase())}
                />

                <Select
                    label="Exchange at"
                    placeholder="Stop"
                    nothingFound="No options"
                    maxDropdownHeight={280}
                    data={
                        stopData
                            ? [
                                  "No Need Exchange",
                                  ...stopData.map((s) => ({
                                      ...s,
                                      value: s.stop,
                                      label: s.name_tc,
                                  })),
                              ]
                            : []
                    }
                    value={stop}
                    onChange={setStop}
                />
                {/* {stopData?.data.map((s) => (
                    <div>
                        <BusStop stop_id={s.stop} />
                    </div>
                ))} */}

                <div className="text-center mt-4">
                    <Button onClick={() => handleSave()}>Save</Button>
                </div>
            </Modal>
            <ActionIcon onClick={() => toggle()}>
                <IconPencil />
            </ActionIcon>
        </Fragment>
    );
};

export default ExchangeWidget;
export { ExchangeData } from "@components/widget/exchange/types";
export { ExchangeDataExchange } from "@components/widget/exchange/types";
