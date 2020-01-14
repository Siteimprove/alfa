import { Decoder, Encoder } from "@siteimprove/alfa-encoding";

import { Body } from "./body";
import { Headers } from "./headers";

/**
 * @see https://fetch.spec.whatwg.org/#request-class
 */
export class Request implements Body {
  public static of(
    method: string,
    url: string,
    headers: Headers = Headers.empty(),
    body: ArrayBuffer = new ArrayBuffer(0)
  ): Request {
    return new Request(method, url, headers, body);
  }

  public static empty(): Request {
    return Request.of("get", "about:blank");
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
      body: Decoder.decode(new Uint8Array(this._body))
    };
  }
}

export namespace Request {
  export interface JSON {
    method: string;
    url: string;
    headers: Headers.JSON;
    body: string;
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
