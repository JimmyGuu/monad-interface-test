/** @type {import('next').NextConfig} */
const TerserPlugin = require("terser-webpack-plugin");

const createBundleStatsPlugin = require("next-plugin-bundle-stats");

const BASE_URL = process.env.NEXT_PUBLIC_API || "https://testnet-api-monad.dapdap.net";
const GAME_BASE_URL =
  process.env.NEXT_PUBLIC_GAME_API_DOMAIN ||
  "https://dev-api-game.beratown.app";

const nextConfig = {
  productionBrowserSourceMaps: true,
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  rewrites: async () => [
    {
      source: "/assets/:path*",
      destination: "https://asset.dapdap.net/:path*"
    },
    {
      source: "/dapdap/:path*",
      destination: BASE_URL + "/:path*"
    },
    {
      source: "/api.dolomite.io/:path*",
      destination: "https://api.dolomite.io/:path*"
    },
    {
      source: "/api.kingdomly/:path*",
      destination: "https://www.kingdomly.app/:path*"
    },
    {
      source: "/api.infrared.finance/:path*",
      destination: "https://infrared.finance/:path*"
    },
    {
      source: "/dapdap.game/:path*",
      destination: `${GAME_BASE_URL}/:path*`
    },
    {
      source: "/api.solver.rpc/:path",
      destination: "https://solver-relay-v2.chaindefuser.com/:path*"
    },
    {
      source: "/api.dapdap.net/:path*",
      destination: `https://api.dapdap.net/:path*`
    },
    {
      source: "/api.db3.app/:path*",
      destination: "https://api.db3.app/:path*"
    },
    {
      source: "/lfj/:path*",
      destination: "https://router-testnet.lfj.gg/:path*"
    },
    {
      source: "/haha-delete/:path*",
      destination: "https://test.nadsa.space/:path*"
    },
    {
      source: "/pancakeswap.finance/:path*",
      destination: "https://pancakeswap.finance/:path*"
    }
  ],
  webpack: (config, { dev }) => {
    config.resolve.alias.stream = "stream-browserify";

    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/ // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"]
      },
      {
        test: /\.json$/,
        type: "json"
      }
    );
    fileLoaderRule.exclude = /\.svg$/i;

    config.optimization = {
      ...config.optimization,
      moduleIds: "deterministic",
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    };

    config.optimization.emitOnErrors = true;
    // if (
    //   process.env.NEXT_PUBLIC_API === "https://testnet-api-monad.dapdap.net"
    // ) {
    //   config.optimization.minimizer = [
    //     new TerserPlugin({
    //       terserOptions: {
    //         compress: {
    //           drop_console: true,
    //           drop_debugger: true,
    //           pure_funcs: ["console.warn"]
    //         },
    //         mangle: {
    //           safari10: true
    //         },
    //         format: {
    //           comments: false
    //         },
    //         ecma: 2015
    //       },
    //       parallel: true
    //     })
    //   ];
    // }
    return config;
  },
  experimental: {
    optimizePackageImports: [
      "d3",
      "ahooks",
      "clsx",
      "lodash",
      "react",
      "react-dom",
      "framer-motion",
      "wagmi",
      "@rainbow-me/rainbowkit",
      "viem",
      "zustand",
      "react-loading-skeleton",
      "date-fns",
      "ethers"
    ]
  },
  images: {
    domains: ["s3.amazonaws.com"]
  },
  headers: async () => {
    return [
      {
        source:
          "/:all*(svg|jpg|jpeg|png|gif|webp|ico|js|css|woff2|woff|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400"
          }
        ]
      }
    ];
  }
};

const withBundleStatsPlugin =
  process.env.ANALYZE_STATS === "true"
    ? createBundleStatsPlugin({
        outDir: "./analyze"
      })
    : (conf) => conf;

module.exports = withBundleStatsPlugin(nextConfig);
