import { Parser } from "@siteimprove/alfa-parser";
import { Image, Keyword, List, URL } from "@siteimprove/alfa-css";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Keyword<"none"> | Image | URL;
}

type Computed = Specified;

/**
 * @internal
 */
export const parse = either(
  Keyword.parse("none"),
  either(Image.parse, URL.parse),
);

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Keyword.of("none");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([initialItem], ", "),
  parseList,
  (value, style) =>
    value.map((images) =>
      images.map((image) =>
        Selective.of(image)
          .if(Image.isImage, (image) =>
            image.partiallyResolve(Resolver.length(style)),
          )
          .get(),
      ),
    ),
);
