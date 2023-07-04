import { Keyword, List, Shadow } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { either } = Parser;

type Specified = Keyword<"none"> | List<Shadow>;

type Computed = Keyword<"none"> | List<Shadow.Canonical>;

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
