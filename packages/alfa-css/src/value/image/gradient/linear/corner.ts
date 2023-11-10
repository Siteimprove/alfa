import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { type Parser as CSSParser, Token } from "../../../../syntax";

import { Value } from "../../../value";

import { Position } from "./position";

const { map, either, pair, option, right } = Parser;

/**
 * @internal
 */
export class Corner extends Value<"corner", false> {
  public static of(
    vertical: Position.Vertical,
    horizontal: Position.Horizontal,
  ): Corner {
    return new Corner(vertical, horizontal);
  }

  private readonly _vertical: Position.Vertical;
  private readonly _horizontal: Position.Horizontal;

  private constructor(
    vertical: Position.Vertical,
    horizontal: Position.Horizontal,
  ) {
    super("corner", false);
    this._vertical = vertical;
    this._horizontal = horizontal;
  }

  /** @public */
  public get vertical(): Position.Vertical {
    return this._vertical;
  }

  /** @public */
  public get horizontal(): Position.Horizontal {
    return this._horizontal;
  }

  public resolve(): Corner.Canonical {
    return this;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Corner &&
      value._vertical === this._vertical &&
      value._horizontal === this._horizontal
    );
  }

  public hash(hash: Hash): void {
    hash.writeString(this._vertical).writeString(this._horizontal);
  }

  public toJSON(): Corner.JSON {
    return {
      ...super.toJSON(),
      vertical: this._vertical,
      horizontal: this._horizontal,
    };
  }

  public toString(): string {
    return `to ${this._vertical} ${this._horizontal}`;
  }
}

/**
 * @internal
 */
export namespace Corner {
  export interface JSON extends Value.JSON<"corner"> {
    vertical: Position.Vertical;
    horizontal: Position.Horizontal;
  }

  export type Canonical = Corner;

  export type Resolver = {};

  const parseCorner = <S1, S2>(
    side1: CSSParser<S1>,
    side2: CSSParser<S2>,
  ): CSSParser<[S1, S2]> =>
    pair(side1, right(option(Token.parseWhitespace), side2));

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-side-or-corner}
   *
   * @internal
   */
  export const parse = right(
    Token.parseIdent("to"),
    right(
      Token.parseWhitespace,
      either(
        map(
          parseCorner(Position.parseVertical, Position.parseHorizontal),
          ([vertical, horizontal]) => Corner.of(vertical, horizontal),
        ),
        map(
          parseCorner(Position.parseHorizontal, Position.parseVertical),
          ([horizontal, vertical]) => Corner.of(vertical, horizontal),
        ),
      ),
    ),
  );
}
