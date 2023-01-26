import { FC, useState } from "react";
import {
    getRouteStopWithName,
    getStopETA,
    KMBDirection,
    KMBStopETA,
    RouteStopWithName,
    toBound,
} from "@apis";
import { useQuery } from "@tanstack/react-query";
import { db, KMBRouteTable } from "../../db";
import Select from "react-select";
import { styleConfig } from "@components/widget/exchange/utils";
import { Button, useMantineColorScheme } from "@mantine/core";
import { ExchangeData, StopOptions } from "@components/widget/exchange/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ExchangeSummary } from "@components/widget/exchange/ExchangeSummary";
import { HistoryDrawer } from "@components/widget/exchange/HistoryDrawer";

dayjs.extend(relativeTime);

interface RouteOption {
    route: string;
    service_type: string;
    direction: KMBDirection;
    label: string;
    value: string;
}

const fillFromRouteList = (routeList?: KMBRouteTable[]): RouteOption[] =>
    routeList?.map((r) => ({
        route: r.route,
        service_type: r.service_type,
        direction: toBound[r.bound],
        label: `${r.route} 住${r.dest_tc} ${r.service_type}`,
        value: `${r.route}-${toBound[r.bound]}-${r.service_type}`,
    })) || [];

const fillToRouteList = (routeList?: KMBStopETA[]): RouteOption[] =>
    routeList?.map((r) => ({
        route: r.route,
        service_type: r.service_type.toString(),
        direction: toBound[r.dir],
        label: `${r.route} 住${r.dest_tc} ${r.service_type}`,
        value: `${r.route}-${toBound[r.dir]}-${r.service_type}`,
        route_dest: r.dest_tc,
    })) || [];

const fillRouteStop = (routeStop?: RouteStopWithName[]): StopOptions[] =>
    routeStop?.map((s, i) => ({
        ...s,
        label: `${i}. ` + s.name_tc,
        value: s.stop,
    })) || [];

type ExchangeProps = {
    from?: RouteOption;
    to?: RouteOption;
    exchange?: StopOptions;
};

const Exchange: FC = () => {
    const { colorScheme } = useMantineColorScheme();
    const [selectedFrom, setSelectedFrom] = useState<RouteOption>();
    const [selectedTo, setSelectedTo] = useState<RouteOption>();
    // exchange Stop ID
    const [exchangeAt, setExchangeAt] = useState<StopOptions>();

    const [exchangeData, setExchangeData] = useState<ExchangeData[]>();

    const { data: routeList } = useQuery({
        queryKey: ["routeList"],
        queryFn: async () => {
            console.log("trigger route list search");
            return db.kmbRouteTable.toArray();
        },
    });

    const { data: stopList } = useQuery({
        queryKey: ["routeStop", selectedFrom ? selectedFrom.value : ""],
        queryFn: async () => {
            console.log("trigger Stop Query");
            if (
                !selectedFrom ||
                !selectedFrom.route ||
                !selectedFrom.service_type ||
                !selectedFrom.direction
            )
                return null;
            return await getRouteStopWithName({
                route: selectedFrom.route,
                service_type: selectedFrom.service_type,
                direction: selectedFrom.direction,
            });
        },
        enabled: !!selectedFrom,
    });

    const { data: toRouteList } = useQuery({
        queryKey: ["routeListETA", selectedFrom, exchangeAt],
        queryFn: async () => {
            console.log("trigger route ETA query");
            const data = await getStopETA(exchangeAt!.value);
            return data.data;
        },
        enabled: !!selectedFrom && !!exchangeAt,
    });

    const handleCalculate = async () => {
        if (!exchangeAt) return;
        const data = await getStopETA(exchangeAt.value);
        const filteredData = data.data.filter(
            (d) =>
                (d.route == selectedFrom?.route &&
                    d.service_type.toString() === selectedFrom?.service_type &&
                    toBound[d.dir] === selectedFrom?.direction) ||
                (d.route == selectedTo?.route &&
                    d.service_type.toString() === selectedTo?.service_type &&
                    toBound[d.dir] === selectedTo?.direction),
        );

        const fromRouteETA = filteredData
            .filter(
                (d) =>
                    d.route == selectedFrom?.route &&
                    d.service_type.toString() === selectedFrom?.service_type &&
                    toBound[d.dir] === selectedFrom?.direction,
            )
            .sort((a, b) => (dayjs(a.eta).isAfter(b.eta) ? 1 : -1));

        const toRouteETA = filteredData
            .filter(
                (d) =>
                    d.route == selectedTo?.route &&
                    d.service_type.toString() === selectedTo?.service_type &&
                    toBound[d.dir] === selectedTo?.direction,
            )
            .sort((a, b) => (dayjs(a.eta).isAfter(b.eta) ? 1 : -1));

        console.log(fromRouteETA, toRouteETA);

        const res = fromRouteETA.map((fETA) => {
            return {
                arriveAt: dayjs(fETA.eta),
                remark: fETA["rmk_tc"],
                exchange: toRouteETA.map((tETA) => {
                    // early return if To bus arrive after the From bus
                    if (
                        !tETA.eta ||
                        !fETA.eta ||
                        dayjs(tETA.eta).isBefore(dayjs(fETA.eta))
                    )
                        return { active: false };
                    return {
                        active: true,
                        arriveAt: dayjs(tETA.eta),
                    };
                }),
            };
        });
        console.log(res);
        setExchangeData(res);
    };

    const saveExchange = async () => {
        if (!selectedFrom || !selectedTo || !exchangeAt) return;
        await db.savedExchange.add({
            from: selectedFrom,
            to: selectedTo,
            exchangeAt: exchangeAt,
        });
    };

    return (
        <div className="rest-height">
            <div className="grid grid-cols-3 items-center px-4 font-bold text-xl h-12 bg-blue-300 dark:bg-blue-600">
                <div />
                <div className="justify-self-center">Exchange</div>
                <div className="justify-self-end">
                    <HistoryDrawer
                        setExchangeAt={setExchangeAt}
                        setSelectedFrom={setSelectedFrom}
                        setSelectedTo={setSelectedTo}
                    />
                </div>
            </div>
            <div className="h-[calc(100vh-3rem-3rem)] overflow-y-auto flex flex-col gap-2">
                <div className="flex flex-col justify-center gap-6 mt-4 px-4">
                    <div>
                        <div>From Route</div>
                        <Select
                            styles={styleConfig(colorScheme)}
                            value={selectedFrom}
                            onChange={(newValue: RouteOption) => {
                                newValue && setSelectedFrom(newValue);
                                setExchangeAt(undefined);
                                setSelectedTo(undefined);
                            }}
                            options={fillFromRouteList(routeList)}
                        />
                    </div>

                    <div>
                        <div>Exchange At</div>
                        <Select
                            styles={styleConfig(colorScheme)}
                            value={exchangeAt}
                            onChange={(newValue: StopOptions) => {
                                newValue && setExchangeAt(newValue);
                                setSelectedTo(undefined);
                            }}
                            options={fillRouteStop(stopList || [])}
                        />
                    </div>

                    <div>
                        <div>To Route</div>
                        <Select
                            styles={styleConfig(colorScheme)}
                            value={selectedTo}
                            onChange={(newValue: RouteOption) =>
                                newValue && setSelectedTo(newValue)
                            }
                            options={fillToRouteList(toRouteList)}
                        />
                    </div>

                    <Button onClick={handleCalculate}>Calculate</Button>
                    <Button onClick={saveExchange} variant="outline">
                        Save
                    </Button>
                </div>
                {exchangeData && (
                    <ExchangeSummary exchangeData={exchangeData} />
                )}
            </div>
        </div>
    );
};

export default Exchange;
