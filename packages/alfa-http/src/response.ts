import { Decoder, Encoder } from "@siteimprove/alfa-encoding";

import { Body } from "./body";
import { Headers } from "./headers";

/**
 * @see https://fetch.spec.whatwg.org/#response-class
 */
export class Response implements Body {
  public static of(
    status: number,
    headers: Headers = Headers.empty(),
    body: ArrayBuffer = new ArrayBuffer(0)
  ): Response {
    return new Response(status, headers, body);
  }

  public static empty(): Response {
    return Response.of(200);
  }

  private readonly _status: number;
  private readonly _headers: Headers;
  private readonly _body: ArrayBuffer;

  private constructor(status: number, headers: Headers, body: ArrayBuffer) {
    this._status = status;
    this._headers = headers;
    this._body = body;
  }

  /**
   * @see https://fetch.spec.whatwg.org/#dom-response-status
   */
  public get status(): number {
    return this._status;
  }

  /**
   * @see https://fetch.spec.whatwg.org/#dom-response-headers
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

  public toJSON(): Response.JSON {
    return {
      status: this._status,
      headers: this._headers.toJSON(),
      body: Decoder.decode(new Uint8Array(this._body))
    };
  }
}

export namespace Response {
  export interface JSON {
    status: number;
    headers: Headers.JSON;
    body: string;
  }

  export function from(json: JSON): Response {
    return Response.of(
      json.status,
      Headers.from(json.headers),
      Encoder.encode(json.body)
    );
  }

  export function isResponse(value: unknown): value is Response {
    return value instanceof Response;
  }
}
