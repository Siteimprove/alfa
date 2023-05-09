import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Length } from "../../calculation";
import { Token } from "../../syntax";

import { Function } from "./function";

const { map, left, right, filter, delimited, option } = Parser;

/**
 * @public
 */
export class Perspective<
  D extends Length = Length
> extends Function<"perspective"> {
  public static of<D extends Length>(depth: D): Perspective<D> {
    return new Perspective(depth);
  }

  private readonly _depth: D;

  private constructor(depth: D) {
    super("perspective", false);
    this._depth = depth;
  }

  public get depth(): D {
    return this._depth;
  }

  public resolve(): Perspective<D> {
    return this;
  }

  public equals(value: unknown): value is this {
    return value instanceof Perspective && value._depth.equals(this._depth);
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._depth);
  }

  public toJSON(): Perspective.JSON {
    return {
      ...super.toJSON(),
      depth: this._depth.toJSON(),
    };
  }

  public toString(): string {
    return `perspective(${this._depth})`;
  }
}

/**
 * @public
 */
export namespace Perspective {
  export interface JSON extends Function.JSON<"perspective"> {
    depth: Length.JSON;
  }

  export function isPerspective<D extends Length>(
    value: unknown
  ): value is Perspective<D> {
    return value instanceof Perspective;
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-perspective}
   */
  export const parse: Parser<Slice<Token>, Perspective, string> = map(
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
