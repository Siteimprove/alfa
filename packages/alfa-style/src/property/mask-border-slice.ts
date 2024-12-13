import {
  Keyword,
  Number,
  Percentage,
  Token,
  Tuple,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { doubleBar, either, filter, map } = Parser;

type NumberPercentage = Number | Percentage;

/**
 * @internal
 */
export type Specified =
  | Tuple<
      [NumberPercentage, NumberPercentage, NumberPercentage, NumberPercentage]
    >
  | Tuple<
      [
        NumberPercentage,
        NumberPercentage,
        NumberPercentage,
        NumberPercentage,
        Keyword<"fill">,
      ]
    >;

const parseNumberPercentage = either(Number.parse, Percentage.parse);

/**
 * @internal
 *
 * @privateRemarks
 * The `doubleBar` parser is used because the `fill` keyword may appear at any position.
 */
export const parse = map(
  filter(
    doubleBar<
      Slice<Token>,
      [
        NumberPercentage,
        NumberPercentage,
        NumberPercentage,
        NumberPercentage,
        Keyword<"fill">,
      ],
      string
    >(
      Token.parseWhitespace,
      parseNumberPercentage,
      parseNumberPercentage,
      parseNumberPercentage,
      parseNumberPercentage,
      Keyword.parse("fill"),
    ),
    (values) =>
      values.some((value) => value !== undefined && !Keyword.isKeyword(value)),
    () => "At least one non-keyword value must be present.",
  ),
  ([p1, p2, p3, p4, fill]) => {
    // At least one number is guaranteed to be defined by the filter above
    // and we assume that `doubleBar` is implemented such that the defined values appears first.
    p1 = p1 as NumberPercentage;

    // Represents the postions in order of [top, right, bottom, left]
    let positions: [
      NumberPercentage,
      NumberPercentage,
      NumberPercentage,
      NumberPercentage,
    ];
    if (p2 === undefined) {
      positions = [p1, p1, p1, p1];
    } else if (p3 === undefined) {
      // when two positions are specified, the first creates slices measured from the **top and bottom**,
      // the second creates slices measured from the **left and right**.
      positions = [p1, p2, p1, p2];
    } else if (p4 === undefined) {
      // when three positions are specified, the first creates a slice measured from the **top**,
      // the second creates slices measured from the **left and right**,
      // the third creates a slice measured from the **bottom**.
      positions = [p1, p2, p3, p2];
    } else {
      positions = [p1, p2, p3, p4];
    }

    return fill !== undefined
      ? Tuple.of(...positions, fill)
      : Tuple.of(...positions);
  },
);

/**
 * @internal
 */
export const initialItem = Tuple.of(
  Number.of(0),
  Number.of(0),
  Number.of(0),
  Number.of(0),
);

type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-slice}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  initialItem,
  parse,
  (value, style) =>
    value.map((tuple) => {
      const [p1, p2, p3, p4, fill] = tuple.values;
      const positions = [
        p1.resolve(Resolver.length(style)),
        p2.resolve(Resolver.length(style)),
        p3.resolve(Resolver.length(style)),
        p4.resolve(Resolver.length(style)),
      ] as const;

      return fill !== undefined
        ? Tuple.of(...positions, fill)
        : Tuple.of(...positions);
    }),
);
