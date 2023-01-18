import Dexie, { Table } from "dexie";
import { KMBRouteStop, KMBRouteType } from "@apis";

export interface Friend {
    id?: number;
    name: string;
    age: number;
}

export interface KMBRouteTable extends KMBRouteType {
    id?: number;
}

export interface KMBRouteStopTable extends KMBRouteStop {
    id?: number;

    name_en: string;
    name_tc: string;
    name_sc: string;
    lat: string;
    long: string;
}

export class MySubClassedDexie extends Dexie {
    // 'friends' is added by dexie when declaring the stores()
    // We just tell the typing system this is the case
    kmbRouteTable!: Table<KMBRouteTable>;
    kmbRouteStopTable!: Table<KMBRouteStopTable>;

    constructor() {
        super("myDatabase");
        this.version(1).stores({
            kmbRouteTable:
                "++id, route, orig_en, orig_tc, dest_en, dest_sc, [route+bound+service_type]",
            // kmbRouteStopTable: "++id, route, stop , [route+bound+service_type]"
        });
    }
}

export const db = new MySubClassedDexie();
