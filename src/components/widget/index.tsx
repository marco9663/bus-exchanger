import {
    ActionIcon,
    Button,
    Modal,
    Select,
    SelectItemProps,
} from "@mantine/core";
import { useFormContext } from "react-hook-form";
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
import { QueryJSON } from "pages/exchange";
import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue, useToggle } from "@mantine/hooks";
import { v4 as uuidv4 } from "uuid";
import { db, KMBRouteTable } from "../../../db";

export type ExchangeWidgetProps = {
    // control: Control<{
    //     data: QueryJSON;
    // }>;
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
    const { setValue, getValues } = useFormContext<{ data: QueryJSON }>();
    const [opened, toggle] = useToggle([false, true]);
    const [stop, setStop] = useState<string | null>(null);
    const [route, setRoute] = useState<Route | null>(null);
    const [exchange, setExchange] = useState<Route[]>([]);
    const [searchValue, onSearchChange] = useState("");
    const [dSearchValue] = useDebouncedValue(searchValue, 300);

    const handleSave = () => {
        if (route && stop) {
            setValue(`data.${index}.route`, route?.route);
            setValue(`data.${index}.service_type`, route?.service_type);
            setValue(`data.${index}.direction`, toBound[route?.bound]);
            setValue(`data.${index}.exchange_stop_id`, stop);
            setValue(`data.${index}.route_id`, route.value);
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
                value: r.id!.toString(),
            }));
            return res;
        },
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
    });
    const handleRouteChange = (routeId: string) => {
        setRoute(
            [...routes, ...exchange].find((r) => r.value === routeId) || null,
        );
        setStop("");
    };
    const previousExchangeStop =
        getValues(`data.${index - 1}.exchange_stop_id`) || "";
    const {} = useQuery({
        queryKey: ["stopETA", previousExchangeStop],
        queryFn: () => getStopETA(previousExchangeStop),
        enabled: index > 0 && !!getValues(`data.${index - 1}.exchange_stop_id`),
        onSuccess(data) {
            setExchange(
                data.data.map((e) => {
                    const {
                        eta,
                        eta_seq,
                        co,
                        rmk_en,
                        rmk_sc,
                        rmk_tc,
                        dir,
                        ...other
                    } = e;
                    return {
                        ...other,
                        bound: dir,
                        value: uuidv4(),
                        label: e.route,
                        orig_en: "",
                        orig_sc: "",
                        orig_tc: "",
                        service_type: e.service_type.toString(),
                    };
                }),
            );
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
