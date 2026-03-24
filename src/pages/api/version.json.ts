import type { NextApiRequest, NextApiResponse } from "next";

export type VersionInfo = {
  version: string | null;
  commit: string | null;
  branch: string | null;
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<VersionInfo>
): void {
  res.status(200).json({
    version: process.env.APP_VERSION || null,
    commit: process.env.GIT_COMMIT_SHA || null,
    branch: process.env.GIT_BRANCH || null
  });
}
