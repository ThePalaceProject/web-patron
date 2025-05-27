import { ServerError } from "errors";
import fetchWithHeaders from "../dataflow/fetch";

export async function fetchAuthToken(url: string, token: string) {
  const response = await fetchWithHeaders(url, token, {}, "POST");
  const json = await response.json();

  if (!response.ok) {
    throw new ServerError(url, response.status, json);
  }
  return json;
}
