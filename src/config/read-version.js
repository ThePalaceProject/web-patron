/**
 * Reads version info from a parsed _version.json object, falling back to git
 * commands for any fields that are absent. All three fields fall back to null
 * if neither source is available.
 *
 * @param {object} versionJson - parsed contents of _version.json, or {}
 * @param {function} execSync - child_process.execSync (injectable for testing)
 * @returns {{ APP_VERSION: string|null, GIT_COMMIT_SHA: string|null, GIT_BRANCH: string|null }}
 */
function readVersionInfo(versionJson = {}, execSync = require("child_process").execSync) {
  const APP_VERSION = versionJson.version || null;

  const GIT_COMMIT_SHA = versionJson.commit || (() => {
    try { return execSync("git rev-parse HEAD").toString().trim(); } catch { return null; }
  })();

  const GIT_BRANCH = versionJson.branch || (() => {
    try { return execSync("git rev-parse --abbrev-ref HEAD").toString().trim(); } catch { return null; }
  })();

  return { APP_VERSION, GIT_COMMIT_SHA, GIT_BRANCH };
}

module.exports = { readVersionInfo };
