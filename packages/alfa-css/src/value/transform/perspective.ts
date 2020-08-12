import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../../syntax/token";
import { Value } from "../../value";

import { Length } from "../length";

const { map, left, right, filter, delimited, option } = Parser;

export class Perspective<D extends Length = Length> extends Value<"transform"> {
  public static of<D extends Length>(depth: D): Perspective<D> {
    return new Perspective(depth);
  }

  private readonly _depth: D;

  private constructor(depth: D) {
    super();
    this._depth = depth;
  }

  public get type(): "transform" {
    return "transform";
  }

  public get kind(): "perspective" {
    return "perspective";
  }

  public get depth(): D {
    return this._depth;
  }

  public equals(value: unknown): value is this {
    return value instanceof Perspective && value._depth.equals(this._depth);
  }

  public hash(hash: Hash): void {
    this._depth.hash(hash);
  }

  public toJSON(): Perspective.JSON {
    return {
      type: "transform",
      kind: "perspective",
      depth: this._depth.toJSON(),
    };
  }

  public toString(): string {
    return `perspective(${this._depth})`;
  }
}

export namespace Perspective {
  export interface JSON extends Value.JSON {
    type: "transform";
    kind: "perspective";
    depth: Length.JSON;
  }

  export function isPerspective<D extends Length>(
    value: unknown
  ): value is Perspective<D> {
    return value instanceof Perspective;
  }

  /**
   * @see https://drafts.csswg.org/css-transforms-2/#funcdef-perspective
   */
  export const parse = map(
    right(
      Token.parseFunction("perspective"),
      left(
        delimited(
          option(Token.parseWhitespace),
          filter(
            Length.parse,
            (length) => length.value >= 0,
            () => "Depth cannot be less than 0"
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (depth) => Perspective.of(depth)
  );
}
