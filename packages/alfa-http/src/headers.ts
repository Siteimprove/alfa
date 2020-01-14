import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";

/**
 * @see https://fetch.spec.whatwg.org/#headers-class
 */
export class Headers {
  public static of(headers: Map<string, string>): Headers {
    return new Headers(headers);
  }

  public static empty(): Headers {
    return new Headers(Map.empty());
  }

  private readonly _headers: Map<string, string>;

  private constructor(headers: Map<string, string>) {
    this._headers = headers;
  }

  /**
   * @see https://fetch.spec.whatwg.org/#dom-headers-get
   */
  public get(header: string): Option<string> {
    return this._headers.get(header);
  }

  /**
   * @see https://fetch.spec.whatwg.org/#dom-headers-has
   */
  public has(header: string): boolean {
    return this._headers.has(header);
  }

  public toJSON(): Headers.JSON {
    return this._headers.toJSON();
  }
}

export namespace Headers {
  export interface JSON extends Array<[string, string]> {}

  export function from(json: JSON): Headers {
    return Headers.of(Map.from(json));
  }

  export function isHeaders(value: unknown): value is Headers {
    return value instanceof Headers;
  }
}
