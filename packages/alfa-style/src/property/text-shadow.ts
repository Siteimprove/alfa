import {
  Current,
  Keyword,
  Length,
  List,
  Percentage,
  RGB,
  Shadow,
  System,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { isKeyword } = Keyword;
const { either } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"none"> | List<Shadow>;

/**
 * @internal
 */
export type Computed =
  | Keyword<"none">
  | List<
      Shadow<
        Length.Fixed<"px">,
        Length.Fixed<"px">,
        Length.Fixed<"px">,
        Length.Fixed<"px">,
        RGB<Percentage, Percentage> | Current | System
      >
    >;

const parseList = List.parseCommaSeparated(
  Shadow.parse({ withInset: false, withSpread: false })
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  either(Keyword.parse("none"), parseList),
  (textShadow, style) =>
    textShadow.map((value) => {
      switch (value.type) {
        case "keyword":
          return value;

        case "list":
          const resolver = Resolver.length(style);

          return value.map((shadow) =>
            Shadow.of(
              shadow.horizontal.resolve(resolver),
              shadow.vertical.resolve(resolver),
              shadow.blur.resolve(resolver),
              shadow.spread.resolve(resolver),
              Resolver.color(shadow.color),
              shadow.isInset
            )
          );
      }
    }),
  { inherits: true }
);
