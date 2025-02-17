import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import type { Node } from "@siteimprove/alfa-dom";
import { Document } from "@siteimprove/alfa-dom";
import { Decoder } from "@siteimprove/alfa-encoding";
import { Request, Response } from "@siteimprove/alfa-http";

import type * as earl from "@siteimprove/alfa-earl";
import type * as json from "@siteimprove/alfa-json";
import type * as sarif from "@siteimprove/alfa-sarif";

import type { Result } from "@siteimprove/alfa-result";
import type { Resource } from "./resource.js";

/**
 * {@link https://en.wikipedia.org/wiki/Web_page}
 *
 * @public
 */
export class Page
  implements
    Resource,
    json.Serializable<Page.JSON>,
    earl.Serializable<Page.EARL>,
    sarif.Serializable<sarif.Artifact>
{
  public static of(
    request: Request,
    response: Response,
    document: Document,
    device: Device,
  ): Page {
    return new Page(request, response, document, device);
  }

  private readonly _request: Request;
  private readonly _response: Response;
  private readonly _document: Document;
  private readonly _device: Device;

  protected constructor(
    request: Request,
    response: Response,
    document: Document,
    device: Device,
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

  public toJSON(options?: Node.SerializationOptions): Page.JSON {
    return {
      request: this._request.toJSON(options),
      response: this._response.toJSON(options),
      document: this._document.toJSON({
        device: this._device,
        ...(options ?? {}),
      }),
      device: this._device.toJSON(options),
    };
  }

  public toEARL(): Page.EARL {
    return {
      "@context": {
        earl: "http://www.w3.org/ns/earl#",
        dct: "http://purl.org/dc/terms/",
      },
      "@type": ["earl:TestSubject"],
      "@id": this.response.url.toString(),
      "dct:source": this.response.url.toString(),
      "dct:hasPart": [this._request.toEARL(), this._response.toEARL()],
    };
  }

  public toSARIF(): sarif.Artifact {
    return {
      location: {
        uri: this.response.url.toString(),
      },
      contents: {
        text: Decoder.decode(new Uint8Array(this.response.body)),
      },
    };
  }
}

/**
 * @public
 */
export namespace Page {
  export interface JSON {
    [key: string]: json.JSON;
    request: Request.JSON;
    response: Response.JSON;
    document: Document.JSON;
    device: Device.JSON;
  }

  export interface EARL extends earl.EARL {
    "@context": {
      earl: "http://www.w3.org/ns/earl#";
      dct: "http://purl.org/dc/terms/";
    };
    "@type": ["earl:TestSubject"];
    "@id": string;
    "dct:source": string;
    "dct:hasPart": [Request.EARL, Response.EARL];
  }

  const cache = Cache.empty<JSON, Result<Page, string>>();

  export function from(json: JSON): Result<Page, string> {
    return cache.get(json, () => {
      const device = Device.from(json.device);
      return Request.from(json.request).andThen((request) =>
        Response.from(json.response).map((response) =>
          Page.of(
            request,
            response,
            Document.from(json.document, device),
            device,
          ),
        ),
      );
    });
  }

  export function isPage(value: unknown): value is Page {
    return value instanceof Page;
  }
}
