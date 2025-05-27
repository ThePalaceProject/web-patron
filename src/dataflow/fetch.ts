/**
 * A simple wrapper around fetch to be used across the whole
 * application. It sets the apropriate headers
 */

import { FetchError } from "errors";

type HttpMethod = "GET" | "DELTE" | "POST" | "PUT";

export default async function fetchWithHeaders(
  url: string,
  token?: string,
  additionalHeaders?: { [key: string]: string | undefined },
  method: HttpMethod = "GET"
) {
  const headers = prepareHeaders(token, additionalHeaders);

  /**
   * Fetch doesn't reject if it receives a response from the server,
   * only if the actual fetch fails due to network failure or permission failure like
   * CORS issues. We catch and rethrow a wrapped error in those cases to give more info.
   */
  try {
    return await fetch(url, { method, headers });
  } catch (e) {
    throw new FetchError(url, e);
  }
}

function prepareHeaders(
  token?: string,
  additionalHeaders?: { [key: string]: string | undefined }
) {
  // Merge the additional headers into any default headers.

  const mergedHeaders: {
    [key: string]: string | undefined;
  } = {
    "X-Requested-With": "XMLHttpRequest",
    ...additionalHeaders
  };

  // The headers to be returned.

  const headers: {
    [key: string]: string;
  } = {};

  // Return only the headers that are not undefined.

  Object.keys(mergedHeaders).forEach(key => {
    const value = mergedHeaders[key];

    if (value !== undefined) {
      headers[key] = value;
    }
  });

  // Add the authorization header if a token is present.

  if (token) {
    headers["Authorization"] = token;
  }

  return headers;
}
