import {
  Image,
  Keyword,
  URL,
  type Parser as CSSParser,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Selective } from "@siteimprove/alfa-selective";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

const { either } = Parser;

export type MaskBorderSource = Keyword<"none"> | Image | URL;

export namespace MaskBorderSource {
  export const parse: CSSParser<MaskBorderSource> = either(
    Keyword.parse("none"),
    either(Image.parse, URL.parse),
  );

  export const initialItem = Keyword.of("none");
}

type Specified = MaskBorderSource;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-border-source}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  MaskBorderSource.initialItem,
  MaskBorderSource.parse,
  (value, style) =>
    value.map((image) =>
      Selective.of(image)
        .if(Image.isImage, (image) =>
          image.partiallyResolve(Resolver.length(style)),
        )
        .get(),
    ),
);
