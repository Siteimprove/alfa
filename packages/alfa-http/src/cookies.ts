import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Option } from "@siteimprove/alfa-option";

import { Cookie } from "./cookie";

export class Cookies implements Iterable<Cookie>, Serializable {
  public static of(cookies: Iterable<Cookie>): Cookies {
    return new Cookies(
      Map.from(Iterable.map(cookies, (cookie) => [cookie.name, cookie]))
    );
  }

  private static _empty = new Cookies(Map.empty());

  public static empty(): Cookies {
    return this._empty;
  }

  private readonly _cookies: Map<string, Cookie>;

  private constructor(cookies: Map<string, Cookie>) {
    this._cookies = cookies;
  }

  public get(name: string): Option<Cookie> {
    return this._cookies.get(name);
  }

  public has(name: string): boolean {
    return this._cookies.has(name);
  }

  public add(cookie: Cookie): Cookies {
    return new Cookies(this._cookies.set(cookie.name, cookie));
  }

  public delete(name: string): Cookies {
    return new Cookies(this._cookies.delete(name));
  }

  public *[Symbol.iterator](): Iterator<Cookie> {
    yield* this._cookies.values();
  }

  public toArray(): Array<Cookie> {
    return [...this];
  }

  public toJSON(): Cookies.JSON {
    return this.toArray().map((cookie) => cookie.toJSON());
  }

  public toString(): string {
    return this.toArray()
      .map((cookie) => cookie.toString())
      .join("; ");
  }
}

export namespace Cookies {
  export interface JSON extends Array<Cookie.JSON> {}

  export function from(json: JSON): Cookies {
    return Cookies.of(json.map((cookie) => Cookie.from(cookie)));
  }

  export function isCookies(value: unknown): value is Cookies {
    return value instanceof Cookies;
  }
}
