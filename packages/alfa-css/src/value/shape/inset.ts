import { Array } from "@siteimprove/alfa-array";
import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import { Keyword } from "../keyword";
import { Length } from "../length";
import { Percentage } from "../percentage";

import { Value } from "../../value";
import { Token } from "../../syntax/token";
import { Function } from "../../syntax/function";

const {
  either,
  map,
  mapResult,
  option,
  pair,
  peek,
  right,
  separatedList,
} = Parser;
const { parseDelim, parseWhitespace } = Token;

/**
 * @see https://drafts.csswg.org/css-shapes/#funcdef-inset
 */
export class Inset<
  O extends Inset.Offset = Inset.Offset,
  C extends Inset.Corner = Inset.Corner
> extends Value<"shape"> {
  public static of<
    O extends Inset.Offset = Inset.Offset,
    C extends Inset.Corner = Inset.Corner
  >(
    offsets: readonly [O, O, O, O],
    corners: Option<readonly [C, C, C, C]>
  ): Inset<O, C> {
    return new Inset(offsets, corners);
  }

  private readonly _offsets: readonly [O, O, O, O];
  private readonly _corners: Option<readonly [C, C, C, C]>;

  private constructor(
    offsets: readonly [O, O, O, O],
    corners: Option<readonly [C, C, C, C]>
  ) {
    super();
    this._offsets = offsets;
    this._corners = corners;
  }

  public get offsets(): readonly [O, O, O, O] {
    return this._offsets;
  }

  public get corners(): Option<readonly [C, C, C, C]> {
    return this._corners;
  }

  public get top(): O {
    return this._offsets[0];
  }

  public get right(): O {
    return this._offsets[1];
  }

  public get bottom(): O {
    return this._offsets[2];
  }

  public get left(): O {
    return this._offsets[3];
  }

  public get topLeft(): Option<C> {
    return this._corners.map((corners) => corners[0]);
  }

  public get topRight(): Option<C> {
    return this._corners.map((corners) => corners[1]);
  }

  public get bottomRight(): Option<C> {
    return this._corners.map((corners) => corners[2]);
  }

  public get bottomLeft(): Option<C> {
    return this._corners.map((corners) => corners[3]);
  }

  public get type(): "shape" {
    return "shape";
  }

  public get kind(): "inset" {
    return "inset";
  }

  public equals(value: this): boolean;
  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Inset &&
      Array.equals(value._offsets, this._offsets) &&
      value._corners.equals(this._corners)
    );
  }

  public hash(hash: Hash): void {
    Array.hash(this._offsets, hash);
    this._corners.hash(hash);
  }

  public toJSON(): Inset.JSON {
    return {
      type: "shape",
      kind: "inset",
      offsets: Array.toJSON(this.offsets),
      corners: this._corners.toJSON(),
    };
  }

  public toString(): string {
    let result = `ellipse(${this.top} ${this.right} ${this.bottom} ${this.left}`;

    if (this._corners.isNone()) {
      return result + ")";
    }

    // printing out the radii in the correct format is not completely trivial…
    if (this._corners.get().some((c) => Array.isArray(c))) {
      // at least one corner has both horizontal and vertical radius, so we need to split things.
      const [tlh, tlv] = Array.isArray(this.topLeft)
        ? this.topLeft
        : [this.topLeft, this.topLeft];
      const [trh, trv] = Array.isArray(this.topRight)
        ? this.topRight
        : [this.topRight, this.topRight];
      const [brh, brv] = Array.isArray(this.bottomRight)
        ? this.bottomRight
        : [this.bottomRight, this.bottomRight];
      const [blh, blv] = Array.isArray(this.bottomLeft)
        ? this.bottomLeft
        : [this.bottomLeft, this.bottomLeft];

      result += `${tlh} ${trh} ${brh} ${blh} / ${tlv} ${trv} ${brv} ${blv})`;
    } else {
      result += `${this.topLeft} ${this.topRight} ${this.bottomRight} ${this.bottomLeft})`;
    }

    return result;
  }
}

export namespace Inset {
  export type Offset = Length | Percentage;
  type Radius = Length | Percentage;
  export type Corner = Radius | readonly [Radius, Radius];

  export interface JSON extends Value.JSON<"shape"> {
    kind: "inset";
    offsets: Serializable.ToJSON<Array<Offset>>;
    corners: Option.JSON<Serializable.ToJSON<Array<Corner>>>;
  }

  const parseLengthPercentage = either(Length.parse, Percentage.parse);

  function parseOneToFour<T>(
    parser: Parser<Slice<Token>, T, string>
  ): Parser<Slice<Token>, readonly [T, T, T, T], string> {
    return map(
      right(
        // make sure we fail if we have nothing
        peek(parser),
        separatedList(parser, parseWhitespace)
      ),
      (result) => {
        const values = [...result];

        return [
          values[0],
          values[1] ?? values[0],
          values[2] ?? values[0],
          values[3] ?? values[1] ?? values[0],
        ];
      }
    );
  }

  const parseRadii = mapResult<
    Slice<Token>,
    readonly [Radius, Radius, Radius, Radius],
    readonly [Radius, Radius, Radius, Radius],
    string
  >(parseOneToFour(parseLengthPercentage), (values) =>
    Iterable.none(values, (value) => value.value < 0)
      ? Ok.of(values)
      : Err.of("Radii cannot be negative")
  );

  const parseCorners: Parser<
    Slice<Token>,
    readonly [Corner, Corner, Corner, Corner],
    string
  > = map(
    pair(
      parseRadii,
      option(
        right(
          option(parseWhitespace),
          right(parseDelim("/"), right(option(parseWhitespace), parseRadii))
        )
      )
    ),
    ([horizontal, vertical]) =>
      vertical.isNone() ? horizontal : zip4(horizontal, vertical.get())
  );

  export const parse = map(
    Function.parse(
      "inset",
      pair(
        parseOneToFour<Offset>(parseLengthPercentage),
        option(
          right(
            option(Token.parseWhitespace),
            right(
              Keyword.parse("round"),
              right(Token.parseWhitespace, parseCorners)
            )
          )
        )
      )
    ),
    ([_, [offsets, corners]]) => Inset.of(offsets, corners)
  );
}

function zip4<T, U>(
  array1: readonly [T, T, T, T],
  array2: readonly [U, U, U, U]
): readonly [[T, U], [T, U], [T, U], [T, U]] {
  return [
    [array1[0], array2[0]],
    [array1[1], array2[1]],
    [array1[2], array2[2]],
    [array1[3], array2[3]],
  ];
}
