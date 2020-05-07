import { Parser } from "@siteimprove/alfa-parser";

import { Token } from "../syntax/token";

const { map } = Parser;

export namespace Position {
  export type Vertical = "top" | "bottom";

  export const parseVertical = map(
    Token.parseIdent(
      (ident) => ident.value === "top" || ident.value === "bottom"
    ),
    (ident) => ident.value as Vertical
  );

  export type Horizontal = "left" | "right";

  export const parseHorizontal = map(
    Token.parseIdent(
      (ident) => ident.value === "left" || ident.value === "right"
    ),
    (ident) => ident.value as Horizontal
  );
}
