import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";
import * as earl from "@siteimprove/alfa-earl";
import * as json from "@siteimprove/alfa-json";

/**
 * @see https://fetch.spec.whatwg.org/#headers-class
 */
export class Headers
  implements Iterable<[string, string]>, json.Serializable, earl.Serializable {
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

  /**
   * @see https://fetch.spec.whatwg.org/#dom-headers-set
   */
  public set(header: string, value: string): Headers {
    return new Headers(this._headers.set(header, value));
  }

  /**
   * @see https://fetch.spec.whatwg.org/#dom-headers-delete
   */
  public delete(header: string): Headers {
    return new Headers(this._headers.delete(header));
  }

  public toJSON(): Headers.JSON {
    return [...this._headers];
  }

  public toEARL(): Headers.EARL {
    return {
      "@context": {
        http: "http://www.w3.org/2011/http#"
      },
      "@list": [
        ...Iterable.map(this._headers, ([name, value]) => {
          return {
            "@type": "http:MessageHeader" as const,
            "http:fieldName": name,
            "http:fieldValue": value
          };
        })
      ]
    };
  }

  public *[Symbol.iterator](): Iterator<[string, string]> {
    yield* this._headers;
  }
}

export namespace Headers {
  export interface JSON extends Array<[string, string]> {}

  export interface EARL extends earl.EARL {
    "@context": {
      http: "http://www.w3.org/2011/http#";
    };
    "@list": Array<{
      "@type": "http:MessageHeader";
      "http:fieldName": string;
      "http:fieldValue": string;
    }>;
  }

  export function from(json: JSON): Headers {
    return Headers.of(Map.from(json));
  }

  export function isHeaders(value: unknown): value is Headers {
    return value instanceof Headers;
  }
}
