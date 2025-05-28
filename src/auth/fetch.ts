import ApplicationError, { ServerError } from "errors";
import { AuthCredentialsToken } from "interfaces";
import fetchWithHeaders from "../dataflow/fetch";

/**
 * Fetch bearer token for authenticating user
 */
export async function fetchAuthToken(
  url: string | undefined,
  token: string | undefined
) {
  if (!url || !token) {
    throw new ApplicationError({
      title: "Incomplete Authentication Info",
      detail: "No URL or Token was provided for authentication"
    });
  }

  const response = await fetchWithHeaders(url, token, {}, "POST");
  const json = await response.json();

  if (!response.ok) {
    throw new ServerError(url, response.status, json);
  }

  return json;
}
