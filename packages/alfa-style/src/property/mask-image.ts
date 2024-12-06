import { Parser } from "@siteimprove/alfa-parser";
import {
  Image,
  Keyword,
  List,
  URL,
  type Parser as CSSParser,
} from "@siteimprove/alfa-css";

const { either } = Parser;

import { Longhand } from "../longhand.js";

export type MaskReference = Keyword<"none"> | Image | URL;

export namespace MaskReference {
  export const parse: CSSParser<MaskReference> = either(
    Keyword.parse("none"),
    either(Image.parse, URL.parse),
  );

  export const initialItem = Keyword.of("none");
}

type Specified = List<MaskReference>;
type Computed = Specified;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image}
 *
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([MaskReference.initialItem], ", "),
  List.parseCommaSeparated(MaskReference.parse),
  (value) => value, // TODO: How to resolve absolute URL?
);
