import path from "path"
import webpack from "webpack"

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-actions"
  ],
  webpackFinal: async config => {
    // mock SWR
    config.resolve.alias['swr'] = require.resolve("./swr-mock.tsx");
    // mock our env vars so they can be updated via the toolbar
    config.resolve.alias['utils/env'] = require.resolve("./env-mock.ts");

    // mock out the decryptor like we do in next.config.js
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /@nypl-simplified-packages\/axisnow-access-control-web/,
        "utils/mockDecryptor.ts"
      )
    );

    config.resolve.modules = [
      path.resolve(__dirname, "../src"),
      "node_modules"
    ]
    
    return config
  },
  refs: {
    'nypl-design-system': {
      title: "NYPL Design System",
      url: "https://nypl.github.io/nypl-design-system/storybook-static/"
    }
  }
}