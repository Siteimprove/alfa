import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Function as CSSFunction,
  type Parser as CSSParser,
  Token,
} from "../../syntax";

import { Length } from "../numeric";

import { Function } from "./function";

const { map, left, right, filter, delimited, option } = Parser;

/**
 * @public
 */
export class Perspective<
  D extends Length.Fixed = Length.Fixed
> extends Function<"perspective", false> {
  public static of<D extends Length.Fixed>(depth: D): Perspective<D> {
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
  export type Canonical = Perspective<Length.Canonical>;

  export interface JSON extends Function.JSON<"perspective"> {
    depth: Length.Fixed.JSON;
  }

  export function isPerspective<D extends Length.Fixed>(
    value: unknown
  ): value is Perspective<D> {
    return value instanceof Perspective;
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-perspective}
   */
  export const parse: CSSParser<Perspective> = map(
    CSSFunction.parse(
      "perspective",
      filter(
        Length.parseBase,
        (length) => length.value >= 0,
        () => "Depth cannot be less than 0"
      )
    ),
    ([_, depth]) => Perspective.of(depth)
  );
}
