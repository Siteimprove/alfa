import { Image, Keyword, URL } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"none"> | Image | URL;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("none"),
  either(Image.parse, URL.parse),
);

/**
 * @internal
 */
export const initialItem = Keyword.of("none");

type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-source}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  initialItem,
  parse,
  (value, style) =>
    value.map((image) =>
      Selective.of(image)
        .if(Image.isImage, (image) =>
          image.partiallyResolve(Resolver.length(style)),
        )
        .get(),
    ),
);
