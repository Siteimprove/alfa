import * as Lang from "@siteimprove/alfa-lang";
import { Grammar } from "@siteimprove/alfa-lang";
import { Token, Ident, Semicolon } from "../alphabet";
import { Declaration, declaration, whitespace } from "../grammar";

const { isArray } = Array;

type Production<T extends Token> = Lang.Production<
  Token,
  Declaration | Array<Declaration>,
  T
>;

const ident: Production<Ident> = {
  token: "ident",
  prefix(token, stream) {
    return declaration(stream, token.value);
  }
};

const semicolon: Production<Semicolon> = {
  token: ";",
  infix(token, stream, expression, left) {
    const declarations = isArray(left) ? left : [left];

    const right = expression();

    if (right !== null) {
      if (isArray(right)) {
        declarations.push(...right);
      } else {
        declarations.push(right);
      }
    }

    return declarations;
  }
};

export const DeclarationGrammar: Grammar<
  Token,
  Declaration | Array<Declaration>
> = new Grammar([ident, semicolon, whitespace]);
