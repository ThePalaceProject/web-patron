import type { NextApiRequest, NextApiResponse } from "next";

export type VersionInfo = {
  version: string | null;
  commit: string | null;
  branch: string | null;
};

const versionInfo: VersionInfo = { version: null, commit: null, branch: null };
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Object.assign(versionInfo, require("../../_version.json"));
} catch {}

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<VersionInfo>
): void {
  res.status(200).json(versionInfo);
}
