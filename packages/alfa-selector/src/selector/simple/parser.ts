import { Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";

const { either, left, map, option, pair } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#typedef-ns-prefix}
 *
 * @internal
 */
export const parseNamespace = map(
  left(
    option(either(Token.parseIdent(), Token.parseDelim("*"))),
    Token.parseDelim("|"),
  ),
  (token) => token.map((token) => token.toString()).getOr(""),
);

/**
 * {@link https://drafts.csswg.org/selectors/#typedef-wq-name}
 *
 * @internal
 */
export const parseName = pair(
  option(parseNamespace),
  map(Token.parseIdent(), (ident) => ident.value),
);
