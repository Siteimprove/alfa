import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, Stream, Char } from "@siteimprove/alfa-lang";
import { Token, TokenType, Ident, Semicolon } from "../alphabet";
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

  stream.accept(token => token.type === TokenType.Whitespace);

  let next = stream.peek(0);

  if (next === null || next.type !== TokenType.Colon) {
    return null;
  }

  stream.advance(1);
  next = stream.peek(0);

  while (next !== null && next.type !== TokenType.Semicolon) {
    value.push(next);
    stream.advance(1);
    next = stream.peek(0);
  }

  const fst = value[value.length - 2];
  const snd = value[value.length - 1];

  if (
    fst !== undefined &&
    fst.type === TokenType.Delim &&
    fst.value === Char.ExclamationMark &&
    snd !== undefined &&
    snd.type === TokenType.Ident &&
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
  token: TokenType.Ident,
  prefix(token, stream) {
    return declaration(stream, token.value);
  }
};

const semicolon: Production<Semicolon> = {
  token: TokenType.Semicolon,
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
