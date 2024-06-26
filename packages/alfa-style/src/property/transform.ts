import { Keyword, List, Transform } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = Keyword<"none"> | List<Transform>;

type Computed = Keyword<"none"> | List<Transform.PartiallyResolved>;

const parse = either(Keyword.parse("none"), Transform.parseList);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/transform}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (transform, style) =>
    transform.map((transform) =>
      Keyword.isKeyword(transform)
        ? transform
        : transform.map(Transform.partiallyResolve(Resolver.length(style))),
    ),
);
