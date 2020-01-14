import { Request, Response } from "@siteimprove/alfa-http";
import { Predicate } from "@siteimprove/alfa-predicate";

const { isObject } = Predicate;

/**
 * @see https://en.wikipedia.org/wiki/Web_resource
 */
export interface Resource {
  readonly request: Request;
  readonly response: Response;
}

export namespace Resource {
  export function isResource(value: unknown): value is Resource {
    return (
      isObject(value) &&
      Request.isRequest(value.request) &&
      Response.isResponse(value.response)
    );
  }
}
