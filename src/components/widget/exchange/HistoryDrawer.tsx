import React, { Dispatch, FC, Fragment, SetStateAction } from "react";
import { useDisclosure } from "@mantine/hooks";
import { Drawer, UnstyledButton } from "@mantine/core";
import { IconHistory, IconX } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { db, SavedExchange } from "../../../../db";
import { RouteOptionMiniDisplay } from "@components/widget/exchange/RouteOptionMiniDisplay";
import { RouteOption, StopOptions } from "@components/widget/exchange/types";
import { IconArrowBigRight } from "@tabler/icons";

export type HistoryDrawerProps = {
    setSelectedFrom: Dispatch<SetStateAction<RouteOption | undefined>>;
    setSelectedTo: Dispatch<SetStateAction<RouteOption | undefined>>;
    setExchangeAt: Dispatch<SetStateAction<StopOptions | undefined>>;
};

export const HistoryDrawer: FC<HistoryDrawerProps> = ({
    setSelectedFrom,
    setSelectedTo,
    setExchangeAt,
}) => {
    const [opened, { open, close, toggle }] = useDisclosure(false);
    const { data: savedExchangeData, refetch } = useQuery({
        queryKey: ["getSavedExchange"],
        queryFn: async () => {
            const data = await db.savedExchange.toArray();
            return data;
        },
    });

    const deleteSavedExchange = async (id: number) => {
        await db.savedExchange.delete(id);
        await refetch();
    };

    const handleDrawerOpen = async () => {
        open();
        await refetch();
    };

    const handleClick = (seData: SavedExchange) => {
        setSelectedFrom(seData.from);
        setSelectedTo(seData.to);
        setExchangeAt(seData.exchangeAt);
        close();
    };
    return (
        <Fragment>
            <Drawer
                opened={opened}
                onClose={close}
                title="Saved Exchange"
                padding="xl"
                size="xl"
                position="right"
            >
                {savedExchangeData?.map((seData) => (
                    <div className="flex gap-2">
                        <UnstyledButton
                            onClick={() => handleClick(seData)}
                            className="w-full"
                        >
                            <div className="grid grid-cols-5 items-center gap-2 justify-between bg-blue-100 dark:bg-blue-800 dark:hover:bg-blue-600 px-4 py-2 hover:bg-blue-300">
                                {seData.from && (
                                    <RouteOptionMiniDisplay
                                        routeOption={seData.from}
                                    />
                                )}
                                <IconArrowBigRight
                                    className="justify-self-center"
                                    fill="black"
                                />
                                <div className="text-xs text-center">
                                    {seData.exchangeAt?.label}
                                </div>
                                <IconArrowBigRight
                                    className="justify-self-center"
                                    fill="black"
                                />
                                {seData.to && (
                                    <RouteOptionMiniDisplay
                                        routeOption={seData.to}
                                    />
                                )}
                            </div>
                        </UnstyledButton>
                        <button onClick={() => deleteSavedExchange(seData.id!)}>
                            <IconX color="red" />
                        </button>
                    </div>
                ))}
            </Drawer>

            <IconHistory onClick={handleDrawerOpen} />
        </Fragment>
    );
};
