import { Array } from "@siteimprove/alfa-array";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Value } from "../../value";
import { Length } from "../length";
import { Percentage } from "../percentage";
import { Keyword } from "../keyword";

import { Token } from "../../syntax/token";
import { Function } from "../../syntax/function";

const {
  either,
  left,
  map,
  option,
  pair,
  right,
  separated,
  separatedList,
} = Parser;
const { parseComma, parseWhitespace } = Token;

/**
 * @see https://drafts.csswg.org/css-shapes/#funcdef-polygon
 */
export class Polygon<
  F extends Polygon.FillRule = Polygon.FillRule,
  V extends Length | Percentage = Length | Percentage
> extends Value<"shape"> {
  public static of<
    F extends Polygon.FillRule = Polygon.FillRule,
    V extends Length | Percentage = Length | Percentage
  >(fillRule: Option<F>, vertices: Iterable<Polygon.Vertex<V>>): Polygon<F, V> {
    return new Polygon(fillRule, Array.from(vertices));
  }

  private readonly _fillRule: Option<F>;
  private readonly _vertices: Array<Polygon.Vertex<V>>;

  private constructor(fillRule: Option<F>, vertices: Array<Polygon.Vertex<V>>) {
    super();
    this._fillRule = fillRule;
    this._vertices = vertices;
  }

  public get fillRule(): Option<F> {
    return this._fillRule;
  }

  public get vertices(): Iterable<Polygon.Vertex<V>> {
    return this.vertices;
  }

  public get type(): "shape" {
    return "shape";
  }

  public get kind(): "polygon" {
    return "polygon";
  }

  public equals(value: this): boolean;
  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Polygon &&
      value._fillRule.equals(this._fillRule) &&
      Array.equals(value._vertices, this._vertices)
    );
  }

  public hash(hash: Hash): void {
    this._fillRule.hash(hash);
    Array.hash(this._vertices, hash);
  }

  public toJSON(): Polygon.JSON<V> {
    return {
      type: "shape",
      kind: "polygon",
      fillRule: this.fillRule.toJSON(),
      vertices: Array.toJSON(this._vertices),
    };
  }

  public toString(): string {
    const fillRule = this._fillRule.isSome() ? `${this.fillRule.get()}, ` : "";
    const vertices = this._vertices.map(([h, v]) => `${h} ${v}`).join(" ");

    return `polygon(${fillRule}${vertices})`;
  }
}

export namespace Polygon {
  export type FillRule = Keyword<"nonzero"> | Keyword<"evenodd">;
  export type Vertex<
    V extends Length | Percentage = Length | Percentage
  > = readonly [V, V];

  export interface JSON<V extends Length | Percentage = Length | Percentage>
    extends Value.JSON<"shape"> {
    kind: "polygon";
    fillRule: Option.JSON<Keyword.JSON<"nonzero"> | Keyword.JSON<"evenodd">>;
    vertices: Array<Serializable.ToJSON<Vertex<V>>>;
  }

  const parseLengthPercentage = either(Length.parse, Percentage.parse);
  const parseVertex = separated(
    parseLengthPercentage,
    parseWhitespace,
    parseLengthPercentage
  );

  export const parse = map(
    Function.parse(
      "polygon",
      pair(
        option(left(Keyword.parse("nonzero", "evenodd"), parseComma)),
        right(
          option(parseWhitespace),
          separatedList(parseVertex, parseWhitespace)
        )
      )
    ),
    ([_, [fillRule, vertices]]) => Polygon.of(fillRule, vertices)
  );
}
