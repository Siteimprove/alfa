import { Image, Keyword } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";

const { either } = Parser;

/**
 * @internal
 */
export type Specified = Keyword<"none"> | Image;

type Computed = Keyword<"none"> | Image.Canonical;

/**
 * @internal
 */
export const parse = either(Keyword.parse("none"), Image.parse);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-source}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  Keyword.of("none"),
  parse,
  (value, style) =>
    value.map((image) => {
      switch (image.type) {
        case "keyword":
          return image;

        case "image":
          return Resolver.image(image, style);
      }
    })
);
