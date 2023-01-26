import { ColorScheme } from "@mantine/core";
import { StylesConfig } from "react-select";
import { QueryJSON } from "../../../../pages/exchange";
import { RouteOption, StopOptions } from "@components/widget/exchange/types";

export const styleConfig = (
    colorScheme: ColorScheme,
): StylesConfig<any, any, any> => ({
    control: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: colorScheme === "dark" ? "#0D1720" : "#CDD2FF",
        color: colorScheme === "dark" ? "#CDD2FF" : "#0D1720",
    }),
    option: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor: colorScheme === "dark" ? "#0D1720" : "#CDD2FF",
        color: colorScheme === "dark" ? "#CDD2FF" : "#0D1720",
    }),
    input: (baseStyles, state) => ({
        ...baseStyles,
        color: colorScheme === "dark" ? "#CDD2FF" : "#0D1720",
    }),
    valueContainer: (base) => ({
        ...base,
        color: colorScheme === "dark" ? "#CDD2FF" : "#0D1720",
    }),
});
export const formRouteValue = (data: QueryJSON[0]): RouteOption => ({
    route: data.route,
    service_type: data.service_type,
    direction: data.direction,
    label: `${data.route} ${data.route_dest ? "住" + data.route_dest : ""} ${
        data.service_type
    }`,
    value: `${data.route}-${data.direction}-${data.service_type}`,
    route_dest: data.route_dest,
});
export const formStopValue = (data: QueryJSON[0]): StopOptions => ({
    value: data.exchange_stop_id!,
    label: data.exchange_stop_name,
});
