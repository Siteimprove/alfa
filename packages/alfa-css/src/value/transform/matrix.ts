import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import { Number } from "../number";

export class Matrix implements Equatable, Serializable {
  public static of(...values: Matrix.Values<Number>): Matrix {
    return new Matrix(values);
  }

  private readonly _values: Matrix.Values<Number>;

  private constructor(values: Matrix.Values<Number>) {
    this._values = values;
  }

  public get values(): Matrix.Values<Number> {
    return this._values;
  }

  public equals(value: unknown): value is this {
    return value instanceof Matrix;
  }

  public toJSON(): Matrix.JSON {
    return {
      type: "matrix",
      values: this._values.map(row =>
        row.map(value => value.toJSON())
      ) as Matrix.Values<Number.JSON>
    };
  }

  public toString(): string {
    const [
      [a, e, i, m],
      [b, f, j, n],
      [c, g, k, o],
      [d, h, l, p]
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

export namespace Matrix {
  export interface JSON {
    [key: string]: json.JSON;
    type: "matrix";
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
}
