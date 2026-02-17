import { http, HttpResponse } from "msw";
import { APP_CONFIG } from "utils/env";
import { PATRON_PROFILE_FIELDS } from "types/patronProfile";

export const openEBackendUrl = APP_CONFIG.libraries["app"]?.authDocUrl.replace(
  "/groups",
  ""
);

export const handlers = [
  http.get("*/patrons/me/", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return new HttpResponse(null, { status: 401 });
    }
    return HttpResponse.json({
      [PATRON_PROFILE_FIELDS.authorizationIdentifier]: "test-patron-id-12345"
    });
  })
];
