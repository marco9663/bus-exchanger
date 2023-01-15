import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons";

import { FC } from "react";

const ColorToggle: FC = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === "dark";

    return (
        <ActionIcon
            variant="transparent"
            onClick={() => toggleColorScheme()}
            title="Toggle color scheme"
            size="xl"
        >
            {dark ? <IconSun /> : <IconMoonStars color="black" />}
        </ActionIcon>
    );
};

export default ColorToggle;
