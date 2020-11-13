import { OPDS1 } from "interfaces";

export default class ApplicationError extends Error {
  info: OPDS1.ProblemDocument;
  baseError?: Error;

  constructor(m: string, baseError?: Error) {
    super(m);
    Object.setPrototypeOf(this, ApplicationError.prototype);
    this.name = "Application Error";
    this.baseError = baseError;
    this.info = {
      title: "Application Error",
      detail: m
    };
  }
}

export class PageNotFoundError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    super(m);
    Object.setPrototypeOf(this, PageNotFoundError.prototype);
    this.baseError = baseError;
    this.name = "Page Not Found Error";
    this.info = {
      title: "Page Not Found",
      detail: m,
      status: 404
    };
  }
}

export class UnimplementedError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    super(m);
    Object.setPrototypeOf(this, UnimplementedError.prototype);
    this.baseError = baseError;
    this.name = "Unimplemented Error";
    this.info = {
      title: "Unimplemented",
      detail: m
    };
  }
}

export class AppSetupError extends ApplicationError {
  constructor(m: string, baseError?: Error) {
    super(m);
    Object.setPrototypeOf(this, AppSetupError.prototype);
    this.name = "App Setup Error";
    this.baseError = baseError;
    this.info = {
      status: 500,
      title: "App Setup Error",
      detail: m
    };
  }
}

/**
 * Specifically for when fetch rejects, not for when you get an invalid response.
 */
export class FetchError extends ApplicationError {
  url: string;

  constructor(url: string, baseError?: Error) {
    super(`Failed to fetch url: ${url}`);
    Object.setPrototypeOf(this, FetchError.prototype);
    this.name = "Fetch Error";
    this.baseError = baseError;
    this.url = url;
    this.info = {
      title: "Fetch Error",
      detail: `The fetch promise for the requested resource was rejected. This is probably an offline, CORS, or other network error. Requested URL: ${url}`
    };
  }
}

function isProblemDocument(
  details: OPDS1.ProblemDocument | OPDS1.AuthDocument
): details is OPDS1.ProblemDocument {
  return !(typeof (details as OPDS1.AuthDocument).id === "string");
}
export class ServerError extends ApplicationError {
  // a default problem document
  url: string;
  info: OPDS1.ProblemDocument = {
    detail: "An unknown error server occurred.",
    title: "Server Error",
    status: 500
  };
  authDocument?: OPDS1.AuthDocument;

  constructor(
    url: string,
    status: number,
    details: OPDS1.ProblemDocument | OPDS1.AuthDocument
  ) {
    super("Server Error");
    this.url = url;
    Object.setPrototypeOf(this, ServerError.prototype);
    if (status === 401 && !isProblemDocument(details)) {
      // 401 errors return auth document instead of problem document
      // we will construct our own problem document.
      this.info = {
        title: "Not Authorized",
        detail: "You are not authorized for the requested resource.",
        status: 401
      };
      this.authDocument = details;
    } else if (isProblemDocument(details)) {
      this.info = details;
    }
    this.name = `Server Error`;
  }
}
