// Set CONFIG_FILE to a known path for tests that exercise the runtime config loader.
// Component and unit tests do not need CONFIG_FILE; they use mockConfig() instead.
process.env.CONFIG_FILE = "community-config.yml";
