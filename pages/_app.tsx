import "tailwindcss/tailwind.css";
import "@styles/global.css";

import {
    ColorScheme,
    ColorSchemeProvider,
    MantineProvider,
    createEmotionCache,
} from "@mantine/core";
import {
    Hydrate,
    QueryClient,
    QueryClientProvider,
    useQuery,
} from "@tanstack/react-query";
import { useCounter, useHotkeys, useLocalStorage } from "@mantine/hooks";

import { AppProps } from "next/app";
import { Layout } from "@components/layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect } from "react";
import { getRouteList } from "@apis";
import { db } from "../db";
import { FirstLoad } from "@components/container/FirstLoad";

const myCache = createEmotionCache({ key: "mantine", prepend: false });

function MyApp({
    Component,
    pageProps,
}: AppProps<{ dehydratedState: unknown }>): JSX.Element {
    const queryClient = new QueryClient();

    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: "mantine-color-scheme",
        defaultValue: "light",
        getInitialValueInEffect: true,
    });
    useEffect(() => {
        if (colorScheme == "dark")
            document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
    }, [colorScheme]);
    const toggleColorScheme = (value?: ColorScheme) => {
        setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
    };
    useHotkeys([["mod+J", () => toggleColorScheme()]]);

    return (
        <QueryClientProvider client={queryClient}>
            <FirstLoad>
                <ReactQueryDevtools initialIsOpen={false} />
                <Hydrate state={pageProps.dehydratedState}>
                    <ColorSchemeProvider
                        colorScheme={colorScheme}
                        toggleColorScheme={toggleColorScheme}
                    >
                        <MantineProvider
                            withGlobalStyles
                            withNormalizeCSS
                            emotionCache={myCache}
                            theme={{
                                colorScheme,
                                breakpoints: {
                                    xs: 640,
                                    sm: 768,
                                    md: 1024,
                                    lg: 1280,
                                    xl: 1536,
                                },
                            }}
                        >
                            <Layout>
                                <Component {...pageProps} />
                            </Layout>
                        </MantineProvider>
                    </ColorSchemeProvider>
                </Hydrate>
            </FirstLoad>
        </QueryClientProvider>
    );
}

export default MyApp;
