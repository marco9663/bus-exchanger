import { FC, ReactNode } from "react";

export const Container: FC<{ children: ReactNode }> = ({ children }) => {
    return <div className="min-h-screen flex flex-col">{children}</div>;
};
