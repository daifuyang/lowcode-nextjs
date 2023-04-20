/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    largePageDataBytes: 128 * 100000,
  },
  async rewrites() {
    return {
      fallback: [
        // These rewrites are checked after both pages/public files
        // and dynamic routes are checked
        {
          source: '/api/:api*',
          destination: `${process.env.baseURL}/api/:api*`,
        },
      ],
    }
  },
  reactStrictMode: false,
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    // Important: return the modified config

    config.module.rules.push(
      {
        test: /\.m?js$/,
        resolve: {
          // 关闭fullySpecified
          fullySpecified: false, // disable the behaviour
        },
      }
    )
    return config
  },

}

module.exports = nextConfig
