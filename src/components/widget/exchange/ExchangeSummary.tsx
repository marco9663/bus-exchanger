import { FC, Fragment } from "react";
import { ExchangeData } from "@components/widget";
import { useId } from "@mantine/hooks";

import "dayjs/locale/zh-hk";
import "dayjs/locale/zh-cn";
import "dayjs/locale/en";
import dayjs from "dayjs";
import { Divider, Popover } from "@mantine/core";

dayjs.locale("zh-hk");

type ExchangeSummaryProps = {
    exchangeData: ExchangeData[];
};

export const ExchangeSummary: FC<ExchangeSummaryProps> = ({ exchangeData }) => {
    return (
        <div className="mx-4 p-4 my-8 flex flex-col gap-5 dark:bg-blue-900 bg-blue-300 rounded-lg">
            {exchangeData.map((exData, i) => (
                <Fragment>
                    {i !== 0 && <Divider size="xs" color="gray" />}
                    <div
                        key={useId(`${i}-exchangeData`)}
                        className="flex justify-between"
                    >
                        <div>班次: {exData.arriveAt.format("hh:mm:ss A")}</div>

                        <div className="flex">
                            <div className=" text-zinc-600 dark:text-zinc-400">
                                等候時間
                            </div>
                            <div>
                                {exData.exchange.map((exBus) =>
                                    exBus.active ? (
                                        <div className="pl-4">
                                            <Popover
                                                width={200}
                                                position="bottom"
                                                withArrow
                                                shadow="md"
                                            >
                                                <Popover.Target>
                                                    <p className="w-fit">
                                                        {exBus.arriveAt?.from(
                                                            exData.arriveAt,
                                                            true,
                                                        )}
                                                    </p>
                                                </Popover.Target>
                                                <Popover.Dropdown>
                                                    <div>
                                                        {exBus.arriveAt?.format(
                                                            "hh:mm:ss A",
                                                        )}
                                                    </div>
                                                </Popover.Dropdown>
                                            </Popover>
                                        </div>
                                    ) : (
                                        <Fragment />
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </Fragment>
            ))}
            <div className="text-sm">*班次時間為到達轉車站之時間</div>
        </div>
    );
};
