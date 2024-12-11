import { Keyword, List, type Parser as CSSParser } from "@siteimprove/alfa-css";

import { Longhand } from "../longhand.js";
import { Resolver } from "../resolver.js";

export type MaskingMode =
  | Keyword<"alpha">
  | Keyword<"luminance">
  | Keyword<"match-source">;

export namespace MaskingMode {
  export const parse: CSSParser<MaskingMode> = Keyword.parse(
    "alpha",
    "luminance",
    "match-source",
  );
  export const initialItem = Keyword.of("match-source");
}

type Specified = List<MaskingMode>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-mode}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([MaskingMode.initialItem], ", "),
  List.parseCommaSeparated(MaskingMode.parse),
  (value, style) => value.map(Resolver.layers(style, "mask-image")),
);
