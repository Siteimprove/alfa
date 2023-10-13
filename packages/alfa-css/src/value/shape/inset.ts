import { Array } from "@siteimprove/alfa-array";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Function, type Parser as CSSParser, Token } from "../../syntax";

import { Keyword } from "../keyword";
import { LengthPercentage } from "../numeric";
import { Value } from "../value";

import { BasicShape } from "./basic-shape";
import { Corner } from "./corner";

const { delimited, either, map, filter, option, pair, right, separatedList } =
  Parser;
const { parseDelim, parseWhitespace } = Token;

/**
 * {@link https://drafts.csswg.org/css-shapes/#funcdef-inset}
 *
 * @public
 */
export class Inset<
  O extends Inset.Offset = Inset.Offset,
  C extends Corner = Corner
> extends BasicShape<"inset", HasCalculation<O, C>> {
  public static of<
    O extends Inset.Offset = Inset.Offset,
    C extends Corner = Corner
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
    super(
      "inset",
      (Value.hasCalculation(...offsets) ||
        corners.some((corners) =>
          corners.some(Corner.hasCalculation)
        )) as unknown as HasCalculation<O, C>
    );
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

  public resolve(resolver: Inset.Resolver): Inset.Canonical {
    // map is losing the length of the arrays
    return new Inset(
      this._offsets.map(LengthPercentage.resolve(resolver)) as [
        LengthPercentage.Canonical,
        LengthPercentage.Canonical,
        LengthPercentage.Canonical,
        LengthPercentage.Canonical
      ],
      this._corners.map(
        (corners) =>
          corners.map(Corner.resolve(resolver)) as [
            Corner.Canonical,
            Corner.Canonical,
            Corner.Canonical,
            Corner.Canonical
          ]
      )
    );
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
    hash.writeHashable(this._corners);
  }

  public toJSON(): Inset.JSON<O, C> {
    return {
      ...super.toJSON(),
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

/**
 * @public
 */
export namespace Inset {
  export type Canonical = Inset<LengthPercentage.Canonical, Corner.Canonical>;

  export interface JSON<O extends Offset = Offset, C extends Corner = Corner>
    extends BasicShape.JSON<"inset"> {
    offsets: Serializable.ToJSON<readonly [O, O, O, O]>;
    corners: Option.JSON<readonly [C, C, C, C]>;
  }

  export type Offset = LengthPercentage;

  export type Resolver = LengthPercentage.Resolver;

  export type PartiallyResolved = Inset<
    LengthPercentage.PartiallyResolved,
    Corner.PartiallyResolved
  >;

  export type PartialResolver = LengthPercentage.PartialResolver;

  export function partiallyResolve(
    resolver: PartialResolver
  ): (value: Inset) => PartiallyResolved {
    return (value) =>
      Inset.of(
        value.offsets.map(LengthPercentage.partiallyResolve(resolver)) as [
          LengthPercentage.PartiallyResolved,
          LengthPercentage.PartiallyResolved,
          LengthPercentage.PartiallyResolved,
          LengthPercentage.PartiallyResolved
        ],
        value.corners.map(
          (corners) =>
            corners.map(Corner.partiallyResolve(resolver)) as [
              Corner.PartiallyResolved,
              Corner.PartiallyResolved,
              Corner.PartiallyResolved,
              Corner.PartiallyResolved
            ]
        )
      );
  }

  export function isInset(value: unknown): value is Inset {
    return value instanceof Inset;
  }

  const parseOffsets = map(
    separatedList(LengthPercentage.parse, option(parseWhitespace), 1, 4),
    ([top, right = top, bottom = top, left = right]) =>
      [top, right, bottom, left] as const
  );

  const parseRadius = filter(
    LengthPercentage.parse,
    // https://drafts.csswg.org/css-values/#calc-range
    (value) => value.hasCalculation() || value.value >= 0,
    () => "Radius cannot be negative"
  );

  const parseRadii = map(
    separatedList(parseRadius, option(parseWhitespace), 1, 4),
    ([
      topLeft,
      topRight = topLeft,
      bottomRight = topLeft,
      bottomLeft = topRight,
    ]) => [topLeft, topRight, bottomRight, bottomLeft] as const
  );

  const parseCorners: CSSParser<readonly [Corner, Corner, Corner, Corner]> =
    map(
      pair(
        parseRadii,
        option(
          right(delimited(option(parseWhitespace), parseDelim("/")), parseRadii)
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

  export const parse: CSSParser<Inset> = map(
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
    ([_, [offsets, corners]]) => Inset.of(offsets, corners)
  );
}

/**
 * Putting this in the Inset namespace clashes with the one in the parent
 * Value namespace that it inherit from (through the classes of the same names)
 */
type HasCalculation<
  O extends Inset.Offset,
  C extends Corner
> = Value.HasCalculation<
  [
    O,
    // It seems we can't really spread ...[R1, R2] in a conditional.
    C extends readonly [infer R extends LengthPercentage, any] ? R : C,
    C extends readonly [any, infer R extends LengthPercentage] ? R : C
  ]
>;
