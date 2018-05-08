import * as Lang from "@alfa/lang";
import { Grammar } from "@alfa/lang";
import { Token, Whitespace, Ident, Semicolon } from "../alphabet";
import { Declaration, declaration } from "../grammar";

const { isArray } = Array;

type Production<T extends Token> = Lang.Production<
  Token,
  Declaration | Array<Declaration>,
  T
>;

const whitespace: Production<Whitespace> = {
  token: "whitespace",
  prefix() {
    return null;
  },
  infix() {
    return null;
  }
};

const ident: Production<Ident> = {
  token: "ident",
  prefix(token, stream) {
    return declaration(stream, token.value);
  }
};

const semicolon: Production<Semicolon> = {
  token: ";",
  infix(token, stream, expression, left) {
    const declarations: Array<Declaration> = [];

    if (isArray(left)) {
      declarations.push(...left);
    } else {
      declarations.push(left);
    }

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
