import ColorToggle from "@components/button/ColorToggle";
import { FC } from "react";

const Settings: FC = () => {
    return (
        <div className="flex flex-col items-center px-4 rest-height">
            <h1>Settings</h1>
            <div className="flex items-center justify-between w-full">
                <p className="font-bold text-xl">Dark Mode</p>
                <ColorToggle />
            </div>
        </div>
    );
};

export default Settings;
