import { BusStop, Route } from "@components/kmb";
import { FC, useEffect } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { INBOUND, KMBDirection, OUTBOUND } from "@apis/kmb";

import { ActionIcon } from "@mantine/core";
import ExchangeWidget from "@components/widget";
import { IconPlus } from "@tabler/icons";
import RouteSelect from "@components/select";
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
            route: "",
            direction: INBOUND,
            service_type: "",
            exchange_stop_id: "",
        },
    ],
};

const Exchange: FC = () => {
    const router = useRouter();
    const { json } = router.query as QueryParam;
    const rawExchange: QueryJSON[] = json
        ? JSON.parse(decodeURIComponent(json || ""))
        : {};

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

    const { fields, append } = useFieldArray({ control, name: "data" });

    return (
        <FormProvider {...methods}>
            <div className="rest-height">
                <div className="flex justify-center items-center font-bold text-xl h-12 bg-blue-300 dark:bg-blue-600">
                    Exchange
                </div>
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
                                    <div className="bg-slate-800 p-4 rounded-lg w-72 h-32 flex justify-between">
                                        <Route
                                            direction={watch(
                                                `data.${index}.direction`,
                                            )}
                                            route={watch(`data.${index}.route`)}
                                            service_type={watch(
                                                `data.${index}.service_type`,
                                            )}
                                        />
                                        <ExchangeWidget index={index} />
                                    </div>
                                    {watch(
                                        `data.${index}.exchange_stop_id`,
                                    ) && (
                                        <BusStop
                                            stop_id={
                                                watch(
                                                    `data.${index}.exchange_stop_id`,
                                                ) as string
                                            }
                                        />
                                    )}

                                    {fields.length === index + 1 && (
                                        <div className="flex justify-center">
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
            </div>
        </FormProvider>
    );
};

export default Exchange;
