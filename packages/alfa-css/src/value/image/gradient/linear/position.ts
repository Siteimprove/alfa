import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../../../../syntax/index.js";

const { map, either } = Parser;

/**
 * @internal
 */
export type Position = Position.Vertical | Position.Horizontal;

/**
 * @internal
 */
export namespace Position {
  export type Vertical = "top" | "bottom";

  export type Horizontal = "left" | "right";

  export const parseVertical = map(
    Token.parseIdent(
      (ident) => ident.value === "top" || ident.value === "bottom",
    ),
    (ident) => ident.value as Vertical,
  );

  export const parseHorizontal = map(
    Token.parseIdent(
      (ident) => ident.value === "left" || ident.value === "right",
    ),
    (ident) => ident.value as Horizontal,
  );

  export const parse = either(parseVertical, parseHorizontal);
}
