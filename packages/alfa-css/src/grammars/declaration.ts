import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, Stream, Char } from "@siteimprove/alfa-lang";
import { Token, Ident, Semicolon } from "../alphabet";
import { whitespace } from "../grammar";

const { isArray } = Array;

/**
 * @see https://www.w3.org/TR/css-syntax/#declaration
 */
export type Declaration = {
  type: "declaration";
  name: string;
  value: Array<Token>;
  important: boolean;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-declaration
 */
export function declaration(
  stream: Stream<Token>,
  name: string
): Declaration | null {
  let value: Array<Token> = [];
  let important: boolean = false;

  stream.accept(token => token.type === "whitespace");

  let next = stream.peek();

  if (next === null || next.type !== ":") {
    return null;
  }

  stream.advance();
  next = stream.peek();

  while (next !== null && next.type !== ";") {
    value.push(next);
    stream.advance();
    next = stream.peek();
  }

  const fst = value[value.length - 2];
  const snd = value[value.length - 1];

  if (
    fst.type === "delim" &&
    fst.value === Char.ExclamationMark &&
    snd.type === "ident" &&
    snd.value === "important"
  ) {
    important = true;
    value = value.slice(0, -2);
  }

  return { type: "declaration", name, value, important };
}

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
