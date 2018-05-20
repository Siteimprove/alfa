import * as Lang from "@siteimprove/alfa-lang";
import {
  Production,
  Expression,
  Stream,
  Command
} from "@siteimprove/alfa-lang";
import {
  Token,
  Whitespace,
  Paren,
  Bracket,
  Brace,
  FunctionName
} from "./alphabet";

/**
 * @see https://www.w3.org/TR/css-syntax/#at-rule
 */
export type AtRule = {
  type: "at-rule";
  name: string;
  prelude: Array<Token>;
  value?: Array<Token>;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#qualified-rule
 */
export type QualifiedRule = {
  type: "qualified-rule";
  prelude: Array<Token>;
  value: Array<Token>;
};

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
 * @see https://www.w3.org/TR/css-syntax/#consume-an-at-rule
 */
export function atRule(stream: Stream<Token>, name: string): AtRule {
  const prelude: Array<Token> = [];

  let next = stream.peek();

  while (next !== null) {
    if (next.type === "{") {
      stream.advance();

      return {
        type: "at-rule",
        name,
        prelude,
        value: block(stream, next.type)
      };
    }

    if (next.type === ";") {
      break;
    }

    prelude.push(value(stream));

    next = stream.peek();
  }

  return {
    type: "at-rule",
    name,
    prelude
  };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-qualified-rule
 */
export function qualifiedRule(stream: Stream<Token>): QualifiedRule | null {
  const prelude: Array<Token> = [];

  let next = stream.peek();

  while (next !== null) {
    if (next.type === "{") {
      stream.advance();

      return {
        type: "qualified-rule",
        prelude,
        value: block(stream, next.type)
      };
    }

    prelude.push(value(stream));

    next = stream.peek();
  }

  return null;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-declaration
 */
export function declaration(
  stream: Stream<Token>,
  name: string
): Declaration | null {
  let values: Array<Token> = [];
  let important: boolean = false;
  let next = stream.peek();

  while (next !== null && next.type === "whitespace") {
    next = stream.next();
  }

  if (next === null || next.type !== ":") {
    return null;
  }

  next = stream.next();

  while (next !== null && next.type !== ";") {
    values.push(value(stream));
    next = stream.peek();
  }

  const fst = values[values.length - 2];
  const snd = values[values.length - 1];

  if (
    fst &&
    fst.type === "delim" &&
    fst.value === "!" &&
    snd &&
    snd.type === "ident" &&
    snd.value === "important"
  ) {
    important = true;
    values = values.slice(0, -2);
  }

  return {
    type: "declaration",
    name,
    value: values,
    important
  };
}

export function value(stream: Stream<Token>): Token {
  const next = stream.next();

  if (next === null) {
    throw new Error("Unexpected end of input");
  }

  return next;
}

export function block<Name extends "[" | "(" | "{">(
  stream: Stream<Token>,
  name: Name
): Array<Token> {
  const values: Array<Token> = [];
  const mirror =
    name === "[" ? "]" : name === "(" ? ")" : name === "{" ? "}" : null;

  let next = stream.peek();

  while (next !== null) {
    if (next.type === mirror) {
      break;
    }

    values.push(value(stream));

    next = stream.peek();
  }

  if (next !== null && next.type === mirror) {
    stream.advance();
  }

  return values;
}

/**
 * @internal
 */
export const whitespace: Production<Token, never, Whitespace> = {
  token: "whitespace",
  prefix() {
    return Command.Continue;
  },
  infix() {
    return Command.Continue;
  }
};
