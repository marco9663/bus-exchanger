// const withPlugins = require("next-compose-plugins");

// module.exports = withPlugins([], {});

const nextTranslate = require("next-translate");
const withPWA = require("next-pwa")({
    dest: "public",
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA(
    nextTranslate({
        reactStrictMode: true,
        swcMinify: true,
        images: {
            domains: ["lh3.googleusercontent.com", "i.imgur.com"],
        },
        eslint: {
            ignoreDuringBuilds: true,
        },
    }),
);

module.exports = nextConfig;
