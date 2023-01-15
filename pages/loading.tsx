import { Center, Loader } from "@mantine/core";

import { FC } from "react";

const Loading: FC = () => {
    return (
        <Center className="rest-height">
            <Loader />
        </Center>
    );
};

export default Loading;
