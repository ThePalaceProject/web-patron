/**
 * Reads version info from a parsed _version.json object, falling back to git
 * commands for any fields that are absent. All three fields fall back to null
 * if neither source is available.
 *
 * @param {object} versionJson - parsed contents of _version.json, or {}
 * @param {function} execSync - child_process.execSync (injectable for testing)
 * @returns {{ APP_VERSION: string|null, GIT_COMMIT_SHA: string|null, GIT_BRANCH: string|null }}
 */
function readVersionInfo(
  versionJson = {},
  execSync = require("child_process").execSync
) {
  const APP_VERSION =
    versionJson.version ||
    (() => {
      try {
        // "git describe --tags --long --abbrev=9" → e.g. "v0.2.7-36-g9308063ca"
        const desc = execSync("git describe --tags --long --abbrev=9").toString().trim();
        const match = desc.match(/^v?(.+)-(\d+)-g([0-9a-f]+)$/);
        if (!match) return null;
        const [, tag, distance, sha] = match;
        // Mirror dunamai's semver style: 39.0.0 if on a tag, else 39.0.0-post.36+<sha>
        return distance === "0" ? tag : `${tag}-post.${distance}+${sha}`;
      } catch {
        return null;
      }
    })();

  const GIT_COMMIT_SHA =
    versionJson.commit ||
    (() => {
      try {
        const sha = execSync("git rev-parse HEAD").toString().trim();
        const dirty =
          execSync("git status --porcelain").toString().trim() !== "";
        return dirty ? `${sha}.dirty` : sha;
      } catch {
        return null;
      }
    })();

  const GIT_BRANCH =
    versionJson.branch ||
    (() => {
      try {
        return execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
      } catch {
        return null;
      }
    })();

  return { APP_VERSION, GIT_COMMIT_SHA, GIT_BRANCH };
}

module.exports = { readVersionInfo };
