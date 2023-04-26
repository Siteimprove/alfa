import { Slice } from "@siteimprove/alfa-slice";
import { Token } from "@siteimprove/alfa-css";

import * as parser from "@siteimprove/alfa-parser";

import { Longhands } from "./longhands";
import { Longhand } from "./longhand";

const { either, end, left } = parser.Parser;

type Name = Longhands.Name;

/**
 * @internal
 */
export class Shorthand<N extends Name = never> {
  public static of<N extends Name>(
    properties: Array<N>,
    parse: Shorthand.Parser<N>
  ) {
    return new Shorthand(
      properties,
      left(
        either(Longhand.parseDefaults, parse),
        end(() => "Expected end of input")
      )
    );
  }

  private readonly _properties: Array<N>;
  private readonly _parse: Shorthand.Parser<N>;

  private constructor(properties: Array<N>, parse: Shorthand.Parser<N>) {
    this._properties = properties;
    this._parse = parse;
  }

  public get properties(): Iterable<N> {
    return this._properties;
  }

  public get parse(): Shorthand.Parser<N> {
    return this._parse;
  }
}

/**
 * @internal
 */
export namespace Shorthand {
  export type Parser<N extends Name = Name> = parser.Parser<
    Slice<Token>,
    | Longhand.Default
    | Iterable<{ [M in N]: readonly [M, Longhands.Declared<M>] }[N]>,
    string
  >;
}
