import { ColorScheme } from "@mantine/core";
import { StylesConfig } from "react-select";
import { QueryJSON } from "../../../../pages/exchange";
import { RouteOption, StopOptions } from "@components/widget/exchange/types";

const light = "hsla(234, 100%, 90%, 1)";
const lightHover = "hsla(235,45%,68%, 1)";
const darkHover = "hsla(207,40%,22%, 1)";
const dark = "hsla(208, 42%, 9%, 1)";

export const styleConfig = (
    colorScheme: ColorScheme,
): StylesConfig<any, any, any> => ({
    control: (baseStyles) => ({
        ...baseStyles,
        backgroundColor: colorScheme === "dark" ? dark : light,
        color: colorScheme === "dark" ? light : dark,
    }),
    option: (baseStyles, state) => ({
        ...baseStyles,
        backgroundColor:
            colorScheme === "dark"
                ? state.isFocused
                    ? darkHover
                    : dark
                : state.isFocused
                ? lightHover
                : light,
        color: colorScheme === "dark" ? light : dark,
    }),
    input: (baseStyles) => ({
        ...baseStyles,
        color: colorScheme === "dark" ? light : dark,
    }),
    singleValue: (base) => ({
        ...base,
        color: colorScheme === "dark" ? light : dark,
    }),
    menuList: (baseStyles) => ({
        ...baseStyles,
        backgroundColor: colorScheme === "dark" ? "#0D1720" : light,
        color: colorScheme === "dark" ? light : "#0D1720",
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
