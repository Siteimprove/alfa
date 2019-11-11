import { Request, Response } from "@siteimprove/alfa-http";

/**
 * @see https://en.wikipedia.org/wiki/Web_resource
 */
export interface Resource {
  readonly request: Request;
  readonly response: Response;
}

export namespace Resource {
  export function of(resource: Partial<Resource>): Resource {
    const {
      request = {
        method: "get",
        url: "about:blank",
        headers: {}
      },

      response = {
        status: 200,
        body: new ArrayBuffer(0),
        headers: {}
      }
    } = resource;

    return { request, response };
  }
}
