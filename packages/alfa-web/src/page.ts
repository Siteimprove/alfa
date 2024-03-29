import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
import { Decoder } from "@siteimprove/alfa-encoding";
import { Request, Response } from "@siteimprove/alfa-http";

import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

import { Result } from "@siteimprove/alfa-result";
import { Resource } from "./resource";

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

  private constructor(
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

  public toJSON(): Page.JSON {
    return {
      request: this._request.toJSON(),
      response: this._response.toJSON(),
      document: this._document.toJSON({ device: this._device }),
      device: this._device.toJSON(),
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

  export function from(json: JSON): Result<Page, string> {
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
  }

  export function isPage(value: unknown): value is Page {
    return value instanceof Page;
  }
}
