import { BusStop, Route } from "@components/kmb";
import { FC, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { INBOUND, OUTBOUND } from "@apis/kmb";

import { ActionIcon } from "@mantine/core";
import ExchangeWidget from "@components/widget";
import { IconChevronDown, IconPlus } from "@tabler/icons";
import { useRouter } from "next/router";
import { z } from "zod";

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

const defaultForm: Record<string, QueryJSON> = {
    data: [
        {
            route_id: "",
            route: "",
            direction: INBOUND,
            service_type: "",
            exchange_stop_id: "",
        },
    ],
};

type ExchangeState = QueryJSON[]

const getRawExchange = (json?: string): QueryJSON[] =>
    json ? JSON.parse(decodeURIComponent(json || "")) : [];

const Exchange: FC = () => {
    const router = useRouter();
    const { json } = router.query as QueryParam;
    const rawExchange = getRawExchange(json)

    useEffect(() => {
        QueryJSONSchema.safeParse(rawExchange);
    }, [rawExchange]);

    const methods = useForm<{
        data: QueryJSON;
    }>({
        defaultValues: QueryJSONSchema.safeParse(rawExchange).success
            ? { data: rawExchange as unknown as QueryJSON }
            : defaultForm,
    });
    const { control, handleSubmit, reset, watch } = methods;

    const onSubmit = (data: { data: QueryJSON }) => {
        console.log(data);
    };

    const { fields, append } = useFieldArray({ control, name: "data" });

    return (
        <FormProvider {...methods}>
            <div className="rest-height">
                <div className="flex justify-center items-center font-bold text-xl h-12 bg-blue-300 dark:bg-blue-600">
                    Exchange
                </div>
                <form id="hook-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex justify-center items-center py-4 flex-col gap-4">
                        {fields.map(
                            (
                                {
                                    id,
                                    direction,
                                    route,
                                    service_type,
                                    exchange_stop_id,
                                },
                                index,
                            ) => {
                                return (
                                    <div key={`${id}`}>
                                        <div className="bg-slate-800 p-4 rounded-lg w-72 h-20 flex justify-between">
                                            <Route
                                                direction={watch(
                                                    `data.${index}.direction`,
                                                )}
                                                route={watch(
                                                    `data.${index}.route`,
                                                )}
                                                service_type={watch(
                                                    `data.${index}.service_type`,
                                                )}
                                            />
                                            <ExchangeWidget index={index} />
                                        </div>
                                        {watch(
                                            `data.${index}.exchange_stop_id`,
                                        ) && (
                                            <div className="flex flex-col justify-center items-center">
                                                <IconChevronDown />
                                                <BusStop
                                                    stop_id={
                                                        watch(
                                                            `data.${index}.exchange_stop_id`,
                                                        ) as string
                                                    }
                                                />
                                                {index !==
                                                    fields.length - 1 && (
                                                    <IconChevronDown />
                                                )}
                                            </div>
                                        )}

                                        {fields.length === index + 1 && (
                                            <div className="flex justify-center mt-2">
                                                <ActionIcon
                                                    onClick={() =>
                                                        append(defaultForm.data)
                                                    }
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
                    <button type="submit" form="hook-form">
                        Calculate
                    </button>
                </form>
            </div>
        </FormProvider>
    );
};

export default Exchange;
