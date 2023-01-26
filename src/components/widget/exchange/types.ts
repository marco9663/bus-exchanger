import { KMBDirection } from "@apis";
import { Dayjs } from "dayjs";

export type ExchangeWidgetProps = {
    index: number;
};

export interface RouteOption {
    readonly value: string;
    readonly route: string;
    readonly direction: KMBDirection;
    readonly service_type: string;
    readonly label: string;
}

export interface StopOptions {
    readonly value: string;
    readonly label: string;
}

export type ExchangeDataExchange = {
    active: boolean;
    arriveAt?: Dayjs;
};
export type ExchangeData = {
    arriveAt: Dayjs;
    remark: string;
    exchange: ExchangeDataExchange[];
};
