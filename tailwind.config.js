module.exports = {
    content: ["./pages/**/*.tsx", "./src/**/*.tsx"],
    darkMode: "class", // or 'media' or 'class'
    theme: {
        extend: {},
        height: (theme) => ({
            auto: "auto",
            ...theme("spacing"),
            full: "100%",
            screen: "calc(var(--vh) * 100)",
        }),
        minHeight: (theme) => ({
            0: "0",
            ...theme("spacing"),
            full: "100%",
            screen: "calc(var(--vh) * 100)",
        }),
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
