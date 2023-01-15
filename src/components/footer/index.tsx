import { IconBus, IconSettings } from "@tabler/icons";

import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";

const buttons = [
    {
        icon: <IconBus size={36} />,
        path: "/",
    },
    {
        icon: <IconSettings size={36} />,
        path: "/settings",
    },
];

export const Footer: React.FC = () => {
    const router = useRouter();
    console.log(router.asPath);
    return (
        <div className="flex justify-evenly items-center bg-blue-200 dark:bg-blue-900 px-4 py-2 h-12">
            {buttons.map((btn) => (
                <Link href={btn.path} key={`footer-${btn.path}`}>
                    <div
                        className={`${
                            router.asPath === btn.path
                                ? "text-zinc-900 dark:text-zinc-100"
                                : "text-zinc-500 dark:text-zinc-400"
                        }`}
                    >
                        {btn.icon}
                    </div>
                </Link>
            ))}
        </div>
    );
};
