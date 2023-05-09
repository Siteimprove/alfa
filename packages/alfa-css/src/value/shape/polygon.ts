import { Array } from "@siteimprove/alfa-array";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Length, Percentage } from "../../calculation";
import { Function, Token } from "../../syntax";
import { Keyword } from "../keyword";
import { Value } from "../../value";

const { either, left, map, option, pair, right, separated, separatedList } =
  Parser;
const { parseComma, parseWhitespace } = Token;

/**
 * {@link https://drafts.csswg.org/css-shapes/#funcdef-polygon}
 *
 * @public
 */
export class Polygon<
  F extends Polygon.Fill = Polygon.Fill,
  V extends Length | Percentage = Length | Percentage
> extends Value<"basic-shape", false> {
  public static of<
    F extends Polygon.Fill = Polygon.Fill,
    V extends Length | Percentage = Length | Percentage
  >(fill: Option<F>, vertices: Iterable<Polygon.Vertex<V>>): Polygon<F, V> {
    return new Polygon(fill, Array.from(vertices));
  }

  private readonly _fill: Option<F>;
  private readonly _vertices: Array<Polygon.Vertex<V>>;

  private constructor(fill: Option<F>, vertices: Array<Polygon.Vertex<V>>) {
    super("basic-shape",false);
    this._fill = fill;
    this._vertices = vertices;
  }

  public get kind(): "polygon" {
    return "polygon";
  }

  public get fill(): Option<F> {
    return this._fill;
  }

  public get vertices(): ReadonlyArray<Polygon.Vertex<V>> {
    return this._vertices;
  }

  public resolve(): Polygon<F, V> {
    return this;
  }

  public equals(value: Polygon): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Polygon &&
      value._fill.equals(this._fill) &&
      Array.equals(value._vertices, this._vertices)
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._fill);
    Array.hash(this._vertices, hash);
  }

  public toJSON(): Polygon.JSON<F, V> {
    return {
      ...super.toJSON(),
      kind: "polygon",
      fill: this._fill.toJSON(),
      vertices: Array.toJSON(this._vertices),
    };
  }

  public toString(): string {
    const fill = this._fill.reduce((_, fill) => `${fill}, `, "");
    const vertices = this._vertices.map(([h, v]) => `${h} ${v}`).join(" ");

    return `polygon(${fill}${vertices})`;
  }
}

/**
 * @public
 */
export namespace Polygon {
  export type Fill = Keyword<"nonzero"> | Keyword<"evenodd">;

  export type Vertex<V extends Length | Percentage = Length | Percentage> =
    readonly [V, V];

  export interface JSON<
    F extends Fill = Fill,
    V extends Length | Percentage = Length | Percentage
  > extends Value.JSON<"basic-shape"> {
    kind: "polygon";
    fill: Option.JSON<F>;
    vertices: Array<Serializable.ToJSON<Vertex<V>>>;
  }

  const parseLengthPercentage = either(Length.parse, Percentage.parse);

  const parseVertex = separated(
    parseLengthPercentage,
    parseWhitespace,
    parseLengthPercentage
  );

  export const parse: Parser<Slice<Token>, Polygon, string> = map(
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
    ([_, [fill, vertices]]) => Polygon.of(fill, vertices)
  );
}
