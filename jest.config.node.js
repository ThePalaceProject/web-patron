// Jest configuration for server-side Node.js tests.
// Uses modern fake timers, no browser setup files, and the node test environment.

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/test-utils/",
    "/src/icons/"
  ],
  injectGlobals: true,
  moduleDirectories: ["node_modules", "src"],
  // Page modules pull in components that import svgs transitively.
  moduleNameMapper: {
    "\\.(svg)$": "<rootDir>/__mocks__/fileMock.ts"
  },
  testEnvironment: "node",
  testMatch: [
    "**/config/**/?(*.)+(spec|test).[tj]s?(x)",
    "**/tests/pages/**/?(*.)+(spec|test).[tj]s?(x)",
    "**/server/**/?(*.)+(spec|test).[tj]s?(x)",
    "**/tests/validation/**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  // arktype and its ark*/@ark/* dependencies ship as ESM and must be transformed.
  transformIgnorePatterns: ["/node_modules/(?!(arktype|arkregex|@ark)/)"],
  // No setup files for Node.js tests - these are browser-specific
  setupFiles: [],
  setupFilesAfterEnv: [],
  // Server-side page tests import .tsx page modules, so jsx/tsx must transform
  // too, with the same theme-ui jsx pragma the browser config uses.
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": [
      "babel-jest",
      {
        presets: [
          [
            "next/babel",
            {
              "preset-react": {
                runtime: "automatic",
                importSource: "theme-ui"
              }
            }
          ]
        ]
      }
    ]
  }
};
