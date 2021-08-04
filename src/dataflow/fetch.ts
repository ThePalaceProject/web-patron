/**
 * A simple wrapper around fetch to be used across the whole
 * application. It sets the apropriate headers
 */

import { FetchError } from "errors";

export default async function fetchWithHeaders(
  url: string,
  token?: string,
  additionalHeaders?: { [key: string]: string }
) {
  const headers = prepareHeaders(token, additionalHeaders);

  /**
   * Fetch doesn't reject if it receives a response from the server,
   * only if the actual fetch fails due to network failure or permission failure like
   * CORS issues. We catch and rethrow a wrapped error in those cases to give more info.
   */
  try {
    return await fetch(url, { headers });
  } catch (e) {
    throw new FetchError(url, e);
  }
}

function prepareHeaders(
  token?: string,
  additionalHeaders?: { [key: string]: string }
) {
  const headers: {
    [key: string]: string;
  } = {
    "X-Requested-With": "XMLHttpRequest",
    ...additionalHeaders
  };
  if (token) {
    headers["Authorization"] = token;
  }
  return headers;
}
