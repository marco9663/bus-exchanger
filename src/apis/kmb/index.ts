import { KMB_API_BASE_URL } from "./constants";
import { db } from "../../../db";
export * from "./helper";
export type KMBApiBaseType = {
    options?: RequestInit;
};

export type KMBApiBaseResponseType = {
    type: string;
    version: "1.0";
    generated_timestamp: Date;
};

export const O = "O";
export const I = "I";
export type KBMBoundType = typeof O | typeof I;
export const INBOUND = "inbound";
export const OUTBOUND = "outbound";
export const toBound: Record<KBMBoundType, typeof INBOUND | typeof OUTBOUND> = {
    O: OUTBOUND,
    I: INBOUND,
};

export const boundMap = (
    bound: KBMBoundType | typeof INBOUND | typeof OUTBOUND,
): KBMBoundType | typeof INBOUND | typeof OUTBOUND => {
    const res: Record<string, KBMBoundType | typeof INBOUND | typeof OUTBOUND> =
        {
            O: OUTBOUND,
            I: INBOUND,
            OUTBOUND: "O",
            INBOUND: "I",
        };
    return res[bound];
};
export type KMBDirection = typeof INBOUND | typeof OUTBOUND;

export type KMBRouteType = {
    route: string;
    bound: KBMBoundType;
    service_type: string;
    orig_en: string;
    orig_tc: string;
    orig_sc: string;
    dest_en: string;
    dest_tc: string;
    dest_sc: string;
};

export type KMBRouteStop = {
    route: string;
    bound: KBMBoundType;
    service_type: string;
    seq: string;
    stop: string;
};

export type KMBGetRouteListResponseType = KMBApiBaseResponseType & {
    data: KMBRouteType[];
};

const defaultOptions: RequestInit = {
    method: "GET",
    headers: new Headers({ "content-type": "application/json" }),
    // mode: "no-cors",
};

export const getRouteList = async (): Promise<KMBGetRouteListResponseType> => {
    const res = await fetch(
        KMB_API_BASE_URL + "v1/transport/kmb/route/",
        defaultOptions,
    );
    return await res.json();
};

export type KMBGetRouteStopParamType = {
    route: string;
    direction: KMBDirection;
    service_type: string;
};

export type KMBGetRouteStopResponseType = KMBApiBaseResponseType & {
    data: KMBRouteStop[];
};

export const getRouteStop = async ({
    direction,
    route,
    service_type,
}: KMBGetRouteStopParamType): Promise<KMBGetRouteStopResponseType> => {
    const res = await fetch(
        `${KMB_API_BASE_URL}v1/transport/kmb/route-stop/${route}/${direction}/${service_type}`,
        defaultOptions,
    );
    return await res.json();
};

export type KMBStop = {
    stop: string;
    name_en: string;
    name_tc: string;
    name_sc: string;
    lat: string;
    long: string;
};

export type KMBGetStopResponseType = KMBApiBaseResponseType & {
    data: KMBStop;
};

export const getStop = async (
    stop_id: string,
): Promise<KMBGetStopResponseType> => {
    const res = await fetch(
        `${KMB_API_BASE_URL}v1/transport/kmb/stop/${stop_id}`,
        defaultOptions,
    );
    return await res.json();
};

export type KMBGetRouteETAParamType = {
    route: string;
    service_type: string;
};
export const ScheduledBusTC = "原定班次";
export const ScheduledBusSC = ScheduledBusTC;
export const ScheduledBusEN = "Scheduled Bus";
export type KMBRMK =
    | typeof ScheduledBusTC
    | typeof ScheduledBusSC
    | typeof ScheduledBusEN
    | string;

export type KMBRouteETA = {
    co: "KMB";
    route: string;
    dir: KBMBoundType;
    service_type: number;
    seq: number; // 6
    dest_tc: string;
    dest_sc: string;
    dest_en: string;
    eta_seq: number; // 1
    eta: string; //"2023-01-15T14:25:53+08:00"
    rmk_tc: KMBRMK;
    rmk_sc: KMBRMK;
    rmk_en: KMBRMK;
    data_timestamp: string; //"2023-01-15T14:12:47+08:00"
};

export type KMBGetRouteETAResponseType = KMBApiBaseResponseType & {
    data: KMBRouteETA[];
};

export const getRouteETA = async ({
    route,
    service_type,
}: KMBGetRouteETAParamType): Promise<KMBGetRouteETAResponseType> => {
    const res = await fetch(
        `${KMB_API_BASE_URL}v1/transport/kmb/route-eta/${route}/${service_type}`,
        defaultOptions,
    );
    return await res.json();
};

export type KMBStopETA = {
    co: "KMB";
    route: string;
    dir: KBMBoundType;
    service_type: number;
    seq: number;
    dest_tc: string;
    dest_sc: string;
    dest_en: string;
    eta_seq: number;
    eta: string | null;
    rmk_tc: string; //"最後班次已過";
    rmk_sc: string; //"最后班次已过";
    rmk_en: string; //"The final bus has departed from this stop";
    data_timestamp: string; //"2023-01-16T23:54:37+08:00";
};

export type KMBgetStopETAResponseType = KMBApiBaseResponseType & {
    data: KMBStopETA[];
};

export const getStopETA = async (
    stop_id: string,
): Promise<KMBgetStopETAResponseType> => {
    const res = await fetch(
        `${KMB_API_BASE_URL}v1/transport/kmb/stop-eta/${stop_id}`,
        defaultOptions,
    );
    return await res.json();
};

export type KMBGetRouteParamType = KMBGetRouteStopParamType;
export type KMBGetRouteResponseType = KMBApiBaseResponseType & {
    data: KMBRouteType;
};
export const getRoute = async ({
    direction,
    route,
    service_type,
}: KMBGetRouteParamType): Promise<KMBGetRouteResponseType> => {
    const res = await fetch(
        `${KMB_API_BASE_URL}v1/transport/kmb/route/${route}/${direction}/${service_type}`,
        defaultOptions,
    );
    return await res.json();
};
