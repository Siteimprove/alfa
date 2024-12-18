import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import type { Option } from "@siteimprove/alfa-option";

import type * as earl from "@siteimprove/alfa-earl";
import type * as json from "@siteimprove/alfa-json";

import { Header } from "./header.js";

/**
 * @public
 */
export class Headers
  implements
    Iterable<Header>,
    json.Serializable<Headers.JSON>,
    earl.Serializable<Headers.EARL>
{
  /**
   * @remarks
   * If the iterable contains headers with duplicate names, the last header with
   * a given name will take precedence.
   */
  public static of(headers: Iterable<Header>): Headers {
    return new Headers(
      Map.from(Iterable.map(headers, (header) => [header.name, header])),
    );
  }

  private static _empty = new Headers(Map.empty());

  public static empty(): Headers {
    return this._empty;
  }

  private readonly _headers: Map<string, Header>;

  protected constructor(headers: Map<string, Header>) {
    this._headers = headers;
  }

  public get(name: string): Option<Header> {
    return this._headers.get(name);
  }

  public has(name: string): boolean {
    return this._headers.has(name);
  }

  public add(header: Header): Headers {
    return new Headers(this._headers.set(header.name, header));
  }

  public delete(name: string): Headers {
    return new Headers(this._headers.delete(name));
  }

  public *[Symbol.iterator](): Iterator<Header> {
    yield* this._headers.values();
  }

  public toArray(): Array<Header> {
    return [...this];
  }

  public toJSON(options?: json.Serializable.Options): Headers.JSON {
    return this.toArray().map((header) => header.toJSON(options));
  }

  public toEARL(): Headers.EARL {
    return {
      "@context": {
        http: "http://www.w3.org/2011/http#",
      },
      "@list": this.toArray().map((header) => header.toEARL()),
    };
  }

  public toString(): string {
    return this.toArray()
      .map((header) => header.toString())
      .join("\n");
  }
}

/**
 * @public
 */
export namespace Headers {
  export interface JSON extends Array<Header.JSON> {}

  export interface EARL extends earl.EARL {
    "@context": {
      http: "http://www.w3.org/2011/http#";
    };
    "@list": Array<Header.EARL>;
  }

  export function from(json: JSON): Headers {
    return Headers.of(json.map((header) => Header.from(header)));
  }

  export function isHeaders(value: unknown): value is Headers {
    return value instanceof Headers;
  }
}
