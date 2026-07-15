import { AppConfig } from "interfaces";
import { fixtures } from "test-utils";
import { setMediaSupportConfig } from "utils/fulfill";
import { setOpds2Enabled } from "dataflow/catalog";

let _currentTestConfig: AppConfig = fixtures.config;

/** Returns the app config currently active for this test. */
export function getCurrentTestConfig(): AppConfig {
  return _currentTestConfig;
}

/**
 * Sets the active app config for the current test. Updates the config-driven
 * singletons (media support and OPDS 2 negotiation, as _app.tsx does at
 * startup) and the shared config used by the render() test wrapper. Call in
 * beforeEach or at the top of a test.
 */
export default function mockConfig(custom?: Partial<AppConfig>) {
  const config: AppConfig = {
    ...fixtures.config,
    ...custom
  };
  _currentTestConfig = config;
  setMediaSupportConfig(config.mediaSupport);
  setOpds2Enabled(config.enableOpds2);
  return config;
}
