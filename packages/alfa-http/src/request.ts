import { Decoder, Encoder } from "@siteimprove/alfa-encoding";
import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";

import { Body } from "./body";
import { Headers } from "./headers";

/**
 * @see https://fetch.spec.whatwg.org/#request-class
 */
export class Request implements Body, json.Serializable, earl.Serializable {
  public static of(
    method: string,
    url: string,
    headers: Headers = Headers.empty(),
    body: ArrayBuffer = new ArrayBuffer(0)
  ): Request {
    return new Request(method, url, headers, body);
  }

  public static empty(): Request {
    return Request.of("GET", "about:blank");
  }

  private readonly _method: string;
  private readonly _url: string;
  private readonly _headers: Headers;
  private readonly _body: ArrayBuffer;

  private constructor(
    method: string,
    url: string,
    headers: Headers,
    body: ArrayBuffer
  ) {
    this._method = method;
    this._url = url;
    this._headers = headers;
    this._body = body;
  }

  /**
   * @see https://fetch.spec.whatwg.org/#dom-request-method
   */
  public get method(): string {
    return this._method;
  }

  /**
   * @see https://fetch.spec.whatwg.org/#dom-request-url
   */
  public get url(): string {
    return this._url;
  }

  /**
   * @see https://fetch.spec.whatwg.org/#dom-request-headers
   */
  public get headers(): Headers {
    return this._headers;
  }

  /**
   * @see https://fetch.spec.whatwg.org/#dom-body-body
   */
  public get body(): ArrayBuffer {
    return this._body;
  }

  public toJSON(): Request.JSON {
    return {
      method: this._method,
      url: this._url,
      headers: this._headers.toJSON(),
      body: Decoder.decode(new Uint8Array(this._body)),
    };
  }

  public toEARL(): Request.EARL {
    return {
      "@context": {
        http: "http://www.w3.org/2011/http#",
      },
      "@type": ["http:Message", "http:Request"],
      "http:methodName": this._method,
      "http:requestURI": this._url,
      "http:headers": this._headers.toEARL(),
      "http:body": {
        "@context": {
          cnt: "http://www.w3.org/2011/content#",
        },
        "@type": ["cnt:Content", "cnt:ContentAsText"],
        "cnt:characterEncoding": "utf-8",
        "cnt:chars": Decoder.decode(new Uint8Array(this._body)),
      },
    };
  }
}

export namespace Request {
  export interface JSON {
    [key: string]: json.JSON;
    method: string;
    url: string;
    headers: Headers.JSON;
    body: string;
  }

  export interface EARL extends earl.EARL {
    "@context": {
      http: "http://www.w3.org/2011/http#";
    };
    "@type": ["http:Message", "http:Request"];
    "http:methodName": string;
    "http:requestURI": string;
    "http:headers": Headers.EARL;
    "http:body": Body.EARL;
  }

  export function from(json: JSON): Request {
    return Request.of(
      json.method,
      json.url,
      Headers.from(json.headers),
      Encoder.encode(json.body)
    );
  }

  export function isRequest(value: unknown): value is Request {
    return value instanceof Request;
  }
}
