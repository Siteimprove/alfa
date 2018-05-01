import * as Lang from "@alfa/lang";
import { Expression, Stream } from "@alfa/lang";
import { Token, Paren, Bracket, Brace, FunctionName } from "./alphabet";

export * from "./grammar/declaration";
export * from "./grammar/rule";
export * from "./grammar/selector";

/**
 * @see https://www.w3.org/TR/css-syntax/#at-rule
 */
export type AtRule = {
  type: "at-rule";
  name: string;
  prelude: Array<ComponentValue>;
  value?: SimpleBlock<"{">;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#qualified-rule
 */
export type QualifiedRule = {
  type: "qualified-rule";
  prelude: Array<ComponentValue>;
  value: SimpleBlock<"{">;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#declaration
 */
export type Declaration = {
  type: "declaration";
  name: string;
  value: Array<ComponentValue>;
  important: boolean;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#component-value
 */
export type ComponentValue = PreservedToken | Function | SimpleBlock;

/**
 * @see https://www.w3.org/TR/css-syntax/#preserved-tokens
 */
export type PreservedToken = Exclude<
  Token,
  FunctionName | Brace<"{"> | Paren<"("> | Bracket<"[">
>;

/**
 * @see https://www.w3.org/TR/css-syntax/#function
 */
export type Function = {
  type: "function";
  name: string;
  value: Array<ComponentValue>;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#simple-block
 */
export type SimpleBlock<Name extends "[" | "(" | "{" = "[" | "(" | "{"> = {
  type: "simple-block";
  name: Name;
  value: Array<ComponentValue>;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-at-rule
 */
export function atRule(stream: Stream<Token>, name: string): AtRule {
  const prelude: Array<ComponentValue> = [];

  let next = stream.peek();

  while (next !== null) {
    if (next.type === "{") {
      stream.advance();

      return {
        type: "at-rule",
        name,
        prelude,
        value: simpleBlock(stream, next.type)
      };
    }

    if (next.type === ";") {
      break;
    }

    prelude.push(componentValue(stream));

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
  const prelude: Array<ComponentValue> = [];

  let next = stream.peek();

  while (next !== null) {
    if (next.type === "{") {
      stream.advance();

      return {
        type: "qualified-rule",
        prelude,
        value: simpleBlock(stream, next.type)
      };
    }

    prelude.push(componentValue(stream));

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
  let value: Array<ComponentValue> = [];
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
    value.push(componentValue(stream));
    next = stream.peek();
  }

  const fst = value[value.length - 2];
  const snd = value[value.length - 1];

  if (
    fst &&
    fst.type === "delim" &&
    fst.value === "!" &&
    snd &&
    snd.type === "ident" &&
    snd.value === "important"
  ) {
    important = true;
    value = value.slice(0, -2);
  }

  return {
    type: "declaration",
    name,
    value,
    important
  };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-component-value
 */
export function componentValue(stream: Stream<Token>): ComponentValue {
  const next = stream.next();

  if (next === null) {
    throw new Error("Unexpected end of input");
  }

  switch (next.type) {
    case "{":
    case "[":
    case "(":
      return simpleBlock(stream, next.type);

    case "function-name":
      return func(stream, next.value);

    case "whitespace":
      return { type: next.type };
    case ":":
      return { type: next.type };
    case ";":
      return { type: next.type };
    case ",":
      return { type: next.type };
    case "}":
      return { type: next.type };
    case "]":
      return { type: next.type };
    case ")":
      return { type: next.type };

    case "comment":
      return { type: next.type, value: next.value };
    case "ident":
      return { type: next.type, value: next.value };
    case "string":
      return { type: next.type, value: next.value };
    case "url":
      return { type: next.type, value: next.value };
    case "delim":
      return { type: next.type, value: next.value };

    case "number":
      return { type: next.type, value: next.value, integer: next.integer };
    case "percentage":
      return { type: next.type, value: next.value, integer: next.integer };

    case "dimension":
      return {
        type: next.type,
        value: next.value,
        integer: next.integer,
        unit: next.unit
      };
  }
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-simple-block
 */
export function simpleBlock<Name extends "[" | "(" | "{">(
  stream: Stream<Token>,
  name: Name
): SimpleBlock<Name> {
  const value: Array<ComponentValue> = [];
  const mirror =
    name === "[" ? "]" : name === "(" ? ")" : name === "{" ? "}" : null;

  let next = stream.peek();

  while (next !== null) {
    if (next.type === mirror) {
      break;
    }

    value.push(componentValue(stream));

    next = stream.peek();
  }

  if (next !== null && next.type === mirror) {
    stream.advance();
  }

  return {
    type: "simple-block",
    name,
    value
  };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-function
 */
export function func(stream: Stream<Token>, name: string): Function {
  const value: Array<ComponentValue> = [];

  let next = stream.peek();

  while (next !== null) {
    value.push(componentValue(stream));
    next = stream.peek();
  }

  return {
    type: "function",
    name,
    value
  };
}
