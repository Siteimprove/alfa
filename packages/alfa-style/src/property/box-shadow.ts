import { Keyword, List, Shadow } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { either } = Parser;

type Specified = Keyword<"none"> | List<Shadow>;

type Computed = Keyword<"none"> | List<Shadow.Canonical>;

const parseList = List.parseCommaSeparated(Shadow.parse());

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  either(Keyword.parse("none"), parseList),
  (boxShadow, style) =>
    boxShadow.map((value) => {
      switch (value.type) {
        case "keyword":
          return value;

        case "list":
          return value.map((shadow) => shadow.resolve(Resolver.length(style)));
      }
    })
);
