import { Array } from "@siteimprove/alfa-array";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../../syntax/token";
import { Function } from "../../syntax/function";
import { Value } from "../../value";

import { Keyword } from "../keyword";
import { Length } from "../length";
import { Percentage } from "../percentage";

const { either, map, filter, option, pair, right, takeAtMost } = Parser;
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

  public equals(value: Inset): boolean;

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

  public toJSON(): Inset.JSON<O, C> {
    return {
      type: "shape",
      kind: "inset",
      offsets: Array.toJSON(this._offsets),
      corners: this._corners.toJSON(),
    };
  }

  public toString(): string {
    const result = `ellipse(${this.top} ${this.right} ${this.bottom} ${this.left}`;

    for (const corners of this._corners) {
      // If at least one corner has both horizontal and vertical radius, we need
      // to split things.
      if (corners.some((corner) => Array.isArray(corner))) {
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

        return (
          result + `${tlh} ${trh} ${brh} ${blh} / ${tlv} ${trv} ${brv} ${blv})`
        );
      } else {
        return (
          result +
          `${this.topLeft} ${this.topRight} ${this.bottomRight} ${this.bottomLeft})`
        );
      }
    }

    return result + ")";
  }
}

export namespace Inset {
  export type Offset = Length | Percentage;

  export type Radius = Length | Percentage;

  export type Corner = Radius | readonly [Radius, Radius];

  export interface JSON<O extends Offset = Offset, C extends Corner = Corner>
    extends Value.JSON<"shape"> {
    kind: "inset";
    offsets: Serializable.ToJSON<readonly [O, O, O, O]>;
    corners: Option.JSON<readonly [C, C, C, C]>;
  }

  const parseLengthPercentage = either(Length.parse, Percentage.parse);

  const parseOffsets = map(
    pair(
      parseLengthPercentage,
      takeAtMost(right(option(Token.parseWhitespace), parseLengthPercentage), 3)
    ),
    ([top, [right = top, bottom = top, left = right]]) =>
      [top, right, bottom, left] as const
  );

  const parseRadius = filter(
    parseLengthPercentage,
    ({ value }) => value >= 0,
    () => "Radius cannot be negative"
  );

  const parseRadii = map(
    pair(
      parseRadius,
      takeAtMost(right(option(Token.parseWhitespace), parseRadius), 3)
    ),
    ([
      topLeft,
      [topRight = topLeft, bottomRight = topLeft, bottomLeft = topRight],
    ]) => [topLeft, topRight, bottomRight, bottomLeft] as const
  );

  const parseCorners = map(
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
      vertical
        .map(
          (vertical) =>
            [
              [horizontal[0], vertical[0]],
              [horizontal[1], vertical[1]],
              [horizontal[2], vertical[2]],
              [horizontal[3], vertical[3]],
            ] as const
        )
        .getOr(horizontal)
  );

  export const parse = map(
    Function.parse(
      "inset",
      pair(
        parseOffsets,
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
    ([_, [offsets, corners]]) => Inset.of<Offset, Corner>(offsets, corners)
  );
}
