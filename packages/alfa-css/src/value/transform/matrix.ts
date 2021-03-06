import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Token } from "../../syntax/token";
import { Value } from "../../value";

import { Number } from "../number";

const { map, left, right, pair, either, take, delimited, option } = Parser;

/**
 * @public
 */
export class Matrix extends Value<"transform"> {
  public static of(...values: Matrix.Values<Number>): Matrix {
    return new Matrix(values);
  }

  private readonly _values: Matrix.Values<Number>;

  private constructor(values: Matrix.Values<Number>) {
    super();
    this._values = values;
  }

  public get type(): "transform" {
    return "transform";
  }

  public get kind(): "matrix" {
    return "matrix";
  }

  public get values(): Matrix.Values<Number> {
    return this._values;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Matrix &&
      value._values.every((row, i) =>
        row.every((value, j) => value.equals(this._values[i][j]))
      )
    );
  }

  public hash(hash: Hash): void {
    for (const row of this._values) {
      for (const number of row) {
        hash.writeHashable(number);
      }
    }
  }

  public toJSON(): Matrix.JSON {
    return {
      type: "transform",
      kind: "matrix",
      values: this._values.map((row) =>
        row.map((value) => value.toJSON())
      ) as Matrix.Values<Number.JSON>,
    };
  }

  public toString(): string {
    const [
      [a, e, i, m],
      [b, f, j, n],
      [c, g, k, o],
      [d, h, l, p],
    ] = this._values;

    if (
      c.value === 0 &&
      d.value === 0 &&
      g.value === 0 &&
      h.value === 0 &&
      i.value === 0 &&
      j.value === 0 &&
      k.value === 1 &&
      l.value === 0 &&
      o.value === 0 &&
      p.value === 1
    ) {
      return `matrix(${[a, b, e, f, m, n].join(", ")})`;
    }

    return `matrix3d(${[a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p].join(
      ", "
    )})`;
  }
}

/**
 * @public
 */
export namespace Matrix {
  export interface JSON extends Value.JSON<"transform"> {
    kind: "matrix";
    values: Values<Number.JSON>;
  }

  export type Values<T> = [
    [T, T, T, T],
    [T, T, T, T],
    [T, T, T, T],
    [T, T, T, T]
  ];

  export function isMatrix(value: unknown): value is Matrix {
    return value instanceof Matrix;
  }

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-matrix}
   */
  const parseMatrix = map(
    right(
      Token.parseFunction("matrix"),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            Number.parse,
            take(
              right(
                delimited(option(Token.parseWhitespace), Token.parseComma),
                Number.parse
              ),
              5
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const _0 = Number.of(0);
      const _1 = Number.of(1);

      const [_a, [_b, _c, _d, _e, _f]] = result;

      return Matrix.of(
        [_a, _c, _0, _e],
        [_b, _d, _0, _f],
        [_0, _0, _1, _0],
        [_0, _0, _0, _1]
      );
    }
  );

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-matrix3d}
   */
  const parseMatrix3d = map(
    right(
      Token.parseFunction("matrix3d"),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            Number.parse,
            take(
              right(
                delimited(option(Token.parseWhitespace), Token.parseComma),
                Number.parse
              ),
              15
            )
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [
        _a,
        [_b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p],
      ] = result;

      return Matrix.of(
        [_a, _e, _i, _m],
        [_b, _f, _j, _n],
        [_c, _g, _k, _o],
        [_d, _h, _l, _p]
      );
    }
  );

  export const parse: Parser<Slice<Token>, Matrix, string> = either(
    parseMatrix,
    parseMatrix3d
  );
}
