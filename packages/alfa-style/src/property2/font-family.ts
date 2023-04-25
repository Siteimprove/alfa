import { Token, Keyword, String } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

import { Longhand } from "../foo-prop-class";

import { List } from "./value/list";

const { delimited, either, map, option, separatedList } = Parser;

/**
 * @internal
 */
export type Specified = List<
  | Keyword<"serif">
  | Keyword<"sans-serif">
  | Keyword<"cursive">
  | Keyword<"fantasy">
  | Keyword<"monospace">
  | String
>;

/**
 * @internal
 */
export type Computed = Specified;

/**
 * @internal
 */
export const parse = map(
  separatedList(
    either(
      Keyword.parse("serif", "sans-serif", "cursive", "fantasy", "monospace"),
      either(
        String.parse,
        map(
          separatedList(Token.parseIdent(), Token.parseWhitespace),
          (idents) => String.of(idents.map((ident) => ident.value).join(" "))
        )
      )
    ),
    delimited(option(Token.parseWhitespace), Token.parseComma)
  ),
  (families) => List.of(families, ", ")
);

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/font-family}
 * @internal
 */
export default Longhand.of<Specified, Computed>(
  List.of([Keyword.of("serif")], ", "),
  parse,
  (fontFamily) => fontFamily,
  {
    inherits: true,
  }
);
