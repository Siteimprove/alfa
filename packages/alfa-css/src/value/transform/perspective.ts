import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax/token";
import { Length } from "../length";

const { map, left, right, filter, delimited, option } = Parser;

export class Perspective<D extends Length = Length>
  implements Equatable, Serializable {
  public static of<D extends Length>(depth: D): Perspective<D> {
    return new Perspective(depth);
  }

  private readonly _depth: D;

  private constructor(depth: D) {
    this._depth = depth;
  }

  public get type(): "perspective" {
    return "perspective";
  }

  public get depth(): D {
    return this._depth;
  }

  public equals(value: unknown): value is this {
    return value instanceof Perspective && value._depth.equals(this._depth);
  }

  public toJSON(): Perspective.JSON {
    return {
      type: "perspective",
      depth: this._depth.toJSON(),
    };
  }

  public toString(): string {
    return `perspective(${this._depth})`;
  }
}

export namespace Perspective {
  export interface JSON {
    [key: string]: json.JSON;
    type: "perspective";
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
