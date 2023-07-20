import { Hash } from "@siteimprove/alfa-hash";
import { Parser } from "@siteimprove/alfa-parser";

import { Function as CSSFunction } from "../../syntax";

import { List } from "../collection";
import { Number } from "../numeric";

import { Function } from "./function";

const { map, either } = Parser;

/**
 * @public
 */
export class Matrix extends Function<"matrix"> {
  public static of(...values: Matrix.Values<Number.Fixed>): Matrix {
    return new Matrix(values);
  }

  private readonly _values: Matrix.Values<Number.Fixed>;

  private constructor(values: Matrix.Values<Number.Fixed>) {
    super("matrix", false);
    this._values = values;
  }

  public get values(): Matrix.Values<Number.Fixed> {
    return this._values;
  }

  public resolve(): Matrix {
    return this;
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
      ...super.toJSON(),
      values: this._values.map((row) =>
        row.map((value) => value.toJSON())
      ) as Matrix.Values<Number.Fixed.JSON>,
    };
  }

  public toString(): string {
    const [[a, e, i, m], [b, f, j, n], [c, g, k, o], [d, h, l, p]] =
      this._values;

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
  export interface JSON extends Function.JSON<"matrix"> {
    values: Values<Number.Fixed.JSON>;
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

  const _0 = Number.of(0);
  const _1 = Number.of(1);

  const parseValues = (name: string, quantity: number) =>
    CSSFunction.parse(
      name,
      map(
        List.parseCommaSeparated(Number.parseBase, quantity, quantity),
        (list) => list.values
      )
    );

  /**
   * {@link https://drafts.csswg.org/css-transforms/#funcdef-transform-matrix}
   */
  const parseMatrix = map(parseValues("matrix", 6), (result) => {
    const [_, [_a, _b, _c, _d, _e, _f]] = result;

    return Matrix.of(
      [_a, _c, _0, _e],
      [_b, _d, _0, _f],
      [_0, _0, _1, _0],
      [_0, _0, _0, _1]
    );
  });

  /**
   * {@link https://drafts.csswg.org/css-transforms-2/#funcdef-matrix3d}
   */
  const parseMatrix3d = map(parseValues("matrix3d", 16), (result) => {
    const [
      _,
      [_a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p],
    ] = result;

    return Matrix.of(
      [_a, _e, _i, _m],
      [_b, _f, _j, _n],
      [_c, _g, _k, _o],
      [_d, _h, _l, _p]
    );
  });

  export const parse = either(parseMatrix, parseMatrix3d);
}
