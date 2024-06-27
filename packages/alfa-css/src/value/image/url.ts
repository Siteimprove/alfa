import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Function,
  type Parser as CSSParser,
  Token,
} from "../../syntax/index.js";
import type { Resolvable } from "../resolvable.js";

import { Value } from "../value.js";

const { map, either } = Parser;

/**
 * {@link https://drafts.csswg.org/css-values/#urls}
 *
 * @public
 */
export class URL extends Value<"url", false> implements Resolvable<URL, never> {
  public static of(url: string): URL {
    return new URL(url);
  }

  private readonly _url: string;

  private constructor(url: string) {
    super("url", false);
    this._url = url;
  }

  public get url(): string {
    return this._url;
  }

  public resolve(): URL {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof URL && value._url === this._url;
  }

  public hash(hash: Hash): void {
    hash.writeString(this._url);
  }

  public toJSON(): URL.JSON {
    return {
      ...super.toJSON(),
      url: this._url,
    };
  }

  public toString(): string {
    return `url(${this._url})`;
  }
}

/**
 * @public
 */
export namespace URL {
  export type Canonical = URL;

  export interface JSON extends Value.JSON<"url"> {
    url: string;
  }

  export type Resolver = {};

  export function isURL(value: unknown): value is URL {
    return value instanceof URL;
  }

  /**
   * {@link https://drafts.csswg.org/css-values/#url-value}
   */
  export const parse: CSSParser<URL> = map(
    either(
      Token.parseURL(),
      map(Function.parse("url", Token.parseString()), ([_, url]) => url),
    ),
    (url) => URL.of(url.value),
  );
}
