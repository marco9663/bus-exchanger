// const withPlugins = require("next-compose-plugins");

// module.exports = withPlugins([], {});

const nextTranslate = require("next-translate");

/** @type {import('next').NextConfig} */
const nextConfig = nextTranslate({
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ["lh3.googleusercontent.com", "i.imgur.com"],
    },
});

module.exports = nextConfig;
