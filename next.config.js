/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
  },
  /* logging: {
    fetches: {
      fullUrl: true,
    },
  }, */
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );
    // Add SVGR:
    // https://react-svgr.com/docs/next/
    // Check what's different with the files under the icons folder:
    // https://react-svgr.com/docs/options/#icon
    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg?nonicon into a non icon (maintain size) component
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: /nonicon$/, // *.svg?nonicon
        use: [{ loader: '@svgr/webpack', options: { icon: false } }],
      },
      // Convert all other *.svg into a icon (remove size) component
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: /url$|nonicon$/ }, // exclude if *.svg?url or *.svg?nonicon
        use: [{ loader: '@svgr/webpack', options: { icon: true } }],
      }
    );

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

module.exports = nextConfig;
