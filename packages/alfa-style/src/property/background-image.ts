import { Image, Keyword, List } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../longhand";
import { Resolver } from "../resolver";
import { Selective } from "@siteimprove/alfa-selective";

const { either } = Parser;

type Specified = List<Specified.Item>;

/**
 * @internal
 */
export namespace Specified {
  export type Item = Keyword<"none"> | Image;
}

type Computed = List<Keyword<"none"> | Image.PartiallyResolved>;

/**
 * @internal
 */
export const parse = either(Keyword.parse("none"), Image.parse);

const parseList = List.parseCommaSeparated(parse);

/**
 * @internal
 */
export const initialItem = Keyword.of("none");

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-image}
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
