import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../syntax/token";
import { Value } from "../value";

const { map, right, either, left, delimited, option } = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#urls
 */
export class URL extends Value<"url"> {
  public static of(url: string): URL {
    return new URL(url);
  }

  private readonly _url: string;

  private constructor(url: string) {
    super();
    this._url = url;
  }

  public get type(): "url" {
    return "url";
  }

  public get url(): string {
    return this._url;
  }

  public equals(value: unknown): value is this {
    return value instanceof URL && value._url === this._url;
  }

  public hash(hash: Hash): void {
    Hash.writeString(hash, this._url);
  }

  public toJSON(): URL.JSON {
    return {
      type: "url",
      url: this._url,
    };
  }

  public toString(): string {
    return `url(${this._url})`;
  }
}

export namespace URL {
  export interface JSON extends Value.JSON {
    type: "url";
    url: string;
  }

  export function isURL(value: unknown): value is URL {
    return value instanceof URL;
  }

  /**
   * @see https://drafts.csswg.org/css-values/#url-value
   */
  export const parse = map(
    either(
      Token.parseURL(),
      right(
        Token.parseFunction("url"),
        left(
          delimited(option(Token.parseWhitespace), Token.parseString()),
          Token.parseCloseParenthesis
        )
      )
    ),
    (url) => URL.of(url.value)
  );
}
