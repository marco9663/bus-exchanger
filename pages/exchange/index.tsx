import { BusStop, Route } from "@components/kmb";
import {
    Context,
    createContext,
    FC,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { INBOUND, OUTBOUND } from "@apis/kmb";

import { ActionIcon } from "@mantine/core";
import ExchangeWidget from "@components/widget";
import {
    IconChevronDown,
    IconPencil,
    IconPlus,
    IconTrashX,
} from "@tabler/icons";
import { useRouter } from "next/router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useId, useListState, UseListStateHandlers } from "@mantine/hooks";
import { FirstRouteWidget } from "@components/widget/exchange/FirstRouteWidget";
import { ExchangeRouteWidget } from "@components/widget/exchange/ExchangeRouteWidget";

// type QueryJSON = {
//     route: string;
//     direction: KMBDirection;
//     service_type: string;
//     exchange_stop_id?: string;
// };

type QueryParam = {
    json: string;
    // route: string;
    // direction: KMBDirection;
    // service_type: string;
};

const QueryJSONSchema = z.array(
    z.object({
        route_id: z.string(),
        route: z.string(),
        direction: z.enum([INBOUND, OUTBOUND]),
        service_type: z.string(),
        exchange_stop_id: z.string().optional(),
    }),
);
export type QueryJSON = z.infer<typeof QueryJSONSchema>;

export interface ExchangeContextType {
    exchanges: QueryJSON;
    handlers: UseListStateHandlers<QueryJSON[0]>;
}

const ExchangeContext = createContext<ExchangeContextType>(
    {} as ExchangeContextType,
);

export const useExchange = (): ExchangeContextType => {
    return useContext(ExchangeContext);
};

const defaultExchange: QueryJSON = [
    {
        route_id: "",
        route: "",
        direction: INBOUND,
        service_type: "",
        exchange_stop_id: "",
    },
];

const getRawExchange = (json?: string): QueryJSON | null =>
    json ? JSON.parse(decodeURIComponent(json || "")) : null;

const Exchange: FC = () => {
    const router = useRouter();
    const { json } = router.query as QueryParam;
    const [exchanges, handlers] = useListState<QueryJSON[0]>([]);
    const _ = useQuery({
        queryKey: ["getRawExchange"],
        queryFn: () => {
            const rawExchange = getRawExchange(json);
            if (!QueryJSONSchema.safeParse(rawExchange).success) {
                handlers.append(defaultExchange[0]);
                return null;
            }
            handlers.append((rawExchange as QueryJSON)[0]);
            return null;
        },
        refetchOnWindowFocus: false,
    });

    const memoedValue = useMemo(
        () => ({
            exchanges,
            handlers,
        }),
        [exchanges, handlers],
    );

    return (
        <ExchangeContext.Provider value={memoedValue}>
            <div className="rest-height">
                <div className="flex justify-center items-center font-bold text-xl h-12 bg-blue-300 dark:bg-blue-600">
                    Exchange
                </div>
                <div className="flex justify-center items-center py-4 flex-col gap-4">
                    {exchanges.map(
                        (
                            {
                                route_id,
                                direction,
                                route,
                                service_type,
                                exchange_stop_id,
                            },
                            index,
                        ) => {
                            return (
                                <div key={useId(route_id)}>
                                    <div className="bg-slate-800 p-4 rounded-lg w-72 h-20 flex justify-between">
                                        <Route
                                            direction={
                                                exchanges[index].direction
                                            }
                                            route={exchanges[index].route}
                                            service_type={
                                                exchanges[index].service_type
                                            }
                                        />
                                        <div className='flex'>
                                            {index === 0 ? (
                                                <FirstRouteWidget
                                                    index={index}
                                                />
                                            ) : (
                                                <ExchangeRouteWidget
                                                    index={index}
                                                />
                                            )}
                                            <ActionIcon
                                                onClick={() =>
                                                    handlers.remove(index)
                                                }
                                            >
                                                <IconTrashX color="#FF1517"/>
                                            </ActionIcon>
                                        </div>
                                    </div>
                                    {exchanges[index].exchange_stop_id && (
                                        <div className="flex flex-col justify-center items-center">
                                            <IconChevronDown />
                                            <BusStop
                                                stop_id={exchanges[
                                                    index
                                                ].exchange_stop_id!.toString()}
                                            />
                                            {index !== exchanges.length - 1 && (
                                                <IconChevronDown />
                                            )}
                                        </div>
                                    )}

                                    {exchanges.length === index + 1 && (
                                        <div className="flex justify-center mt-2">
                                            <ActionIcon
                                                onClick={() => {
                                                    handlers.append(
                                                        defaultExchange[0],
                                                    );
                                                }}
                                            >
                                                <IconPlus />
                                            </ActionIcon>
                                        </div>
                                    )}
                                </div>
                            );
                        },
                    )}
                </div>
                <button
                    onClick={() => {
                        console.log(exchanges);
                    }}
                >
                    Calculate
                </button>
            </div>
        </ExchangeContext.Provider>
    );
};

export default Exchange;
