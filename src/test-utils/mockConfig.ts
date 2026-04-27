import { AppConfig } from "interfaces";
import { fixtures } from "test-utils";
import { setMediaSupportConfig } from "utils/fulfill";

let _currentTestConfig: AppConfig = fixtures.config;

/** Returns the app config currently active for this test. */
export function getCurrentTestConfig(): AppConfig {
  return _currentTestConfig;
}

/**
 * Sets the active app config for the current test. Updates the media support
 * singleton (used by parse/fulfill utilities) and the shared config used by
 * the render() test wrapper. Call in beforeEach or at the top of a test.
 */
export default function mockConfig(custom?: Partial<AppConfig>) {
  const config: AppConfig = {
    ...fixtures.config,
    ...custom
  };
  _currentTestConfig = config;
  setMediaSupportConfig(config.mediaSupport);
  return config;
}
