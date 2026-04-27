// Jest configuration for Node.js tests (build-time scripts)
// This config is used for testing Node.js modules that don't run in the browser

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
  testEnvironment: "node",
  testMatch: [
    "**/config/**/?(*.)+(spec|test).[tj]s?(x)",
    "**/tests/pages/**/?(*.)+(spec|test).[tj]s?(x)",
    "**/server/**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  // arktype and its ark*/@ark/* dependencies ship as ESM and must be transformed.
  transformIgnorePatterns: ["/node_modules/(?!(arktype|arkregex|@ark)/)"],
  // No setup files for Node.js tests - these are browser-specific
  setupFiles: [],
  setupFilesAfterEnv: [],
  transform: {
    "^.+\\.(js|ts)$": [
      "babel-jest",
      {
        presets: [["next/babel"]]
      }
    ]
  }
};
