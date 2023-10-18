import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../../../../syntax";

import { Value } from "../../../value";

import { Position } from "./position";

const { map, option, right } = Parser;

/**
 * @internal
 */
export class Side extends Value<"side", false> {
  public static of(side: Position.Vertical | Position.Horizontal): Side {
    return new Side(side);
  }

  private readonly _side: Position.Vertical | Position.Horizontal;

  private constructor(side: Position.Vertical | Position.Horizontal) {
    super("side", false);
    this._side = side;
  }

  public get side(): Position.Vertical | Position.Horizontal {
    return this._side;
  }

  public resolve(): Side.Canonical {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof Side && value._side === this._side;
  }

  public hash(hash: Hash): void {
    hash.writeString(this._side);
  }

  public toJSON(): Side.JSON {
    return { ...super.toJSON(), side: this._side };
  }

  public toString(): string {
    return `to ${this._side}`;
  }
}

/**
 * @internal
 */
export namespace Side {
  export interface JSON extends Value.JSON<"side"> {
    side: Position.Vertical | Position.Horizontal;
  }

  export type Canonical = Side;

  export type Resolver = {};

  /**
   * {@link https://drafts.csswg.org/css-images/#typedef-side-or-corner}
   *
   * @internal
   */
  export const parse = map(
    right(
      Token.parseIdent("to"),
      right(option(Token.parseWhitespace), Position.parse)
    ),
    (side) => Side.of(side)
  );
}
