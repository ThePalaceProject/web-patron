import fetchWithHeaders from "dataflow/fetch";
import download from "downloadjs";
import { ServerError } from "errors";
import { DownloadMediaType } from "types/opds1";
import { generateFilename, typeMap } from "utils/file";

export default async function downloadFile(
  url: string,
  title: string,
  type: DownloadMediaType,
  token?: string
) {
  let response;

  try {
    response = await fetchWithHeaders(url, token);
  } catch (err) {
    // There was a network or CORS error. In case this was a CORS error, retry the request without
    // the X-Requested-With header. Some distributors' servers may not have this header whitelisted
    // for CORS.

    response = await fetchWithHeaders(url, token, {
      "X-Requested-With": undefined
    });

    console.warn(
      `Download from ${url} only proceeded after retry without X-Requested-With header. Distributor may not allow X-Requested-With for CORS.`
    );
  }

  if (!response.ok && response.redirected) {
    // If the response errored after a redirect, try again without the Authorization header, as it
    // causes errors when redirected to Amazon S3.

    response = await fetch(response.url);
  }

  if (response.ok) {
    return downloadBlob(response, title, type);
  }

  const details = await response.json();
  throw new ServerError(response.url, response.status, details);
}

async function downloadBlob(
  response: Response,
  title: string,
  type: DownloadMediaType
) {
  const blob = await response.blob();
  const extension = typeMap[type]?.extension ?? "";
  download(blob, generateFilename(title ?? "untitled", extension), type);
}
