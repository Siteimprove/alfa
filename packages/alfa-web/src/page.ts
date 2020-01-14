import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Response, Request } from "@siteimprove/alfa-http";

import { Resource } from "./resource";

/**
 * @see https://en.wikipedia.org/wiki/Web_page
 */
export class Page implements Resource {
  public static of(
    request: Request,
    response: Response,
    document: Document,
    device: Device
  ): Page {
    return new Page(request, response, document, device);
  }

  private readonly _request: Request;
  private readonly _response: Response;
  private readonly _document: Document;
  private readonly _device: Device;

  private constructor(
    request: Request,
    response: Response,
    document: Document,
    device: Device
  ) {
    this._request = request;
    this._response = response;
    this._document = document;
    this._device = device;
  }

  public get request(): Request {
    return this._request;
  }

  public get response(): Response {
    return this._response;
  }

  public get document(): Document {
    return this._document;
  }

  public get device(): Device {
    return this._device;
  }

  public toJSON(): Page.JSON {
    return {
      request: this._request.toJSON(),
      response: this._response.toJSON(),
      document: this._document.toJSON(),
      device: this._device.toJSON()
    };
  }
}

export namespace Page {
  export interface JSON {
    request: Request.JSON;
    response: Response.JSON;
    document: Document.JSON;
    device: Device.JSON;
  }

  export function from(json: JSON): Page {
    return Page.of(
      Request.from(json.request),
      Response.from(json.response),
      Document.fromDocument(json.document),
      Device.from(json.device)
    );
  }

  export function isPage(value: unknown): value is Page {
    return value instanceof Page;
  }
}
