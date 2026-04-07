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
    "**/pages/api/**/?(*.)+(spec|test).[tj]s?(x)",
    "**/server/**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  // No setup files for Node.js tests - these are browser-specific
  setupFiles: [],
  setupFilesAfterEnv: []
};
