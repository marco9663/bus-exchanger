import { FC, ReactNode } from "react";

import { Footer } from "..";

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-blue-50 dark:bg-gray-900">
            <main className="grow">{children}</main>
            <Footer></Footer>
        </div>
    );
};
