import {
  Pattern,
  Alphabet,
  Location,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNumeric,
  isAscii,
  lex as $lex
} from "@alfa/lang";

const { assign } = Object;

export type StartTag = Readonly<{
  type: "start-tag";
  value: string;
  closed: boolean;
  attributes: Readonly<{ [name: string]: string }>;
}>;

export type EndTag = Readonly<{
  type: "end-tag";
  value: string;
}>;

export type Comment = Readonly<{ type: "comment"; value: string }>;
export type Character = Readonly<{ type: "character"; value: string }>;

/**
 * @see https://www.w3.org/TR/html53/syntax.html#tokenization
 */
export type HtmlToken =
  // Tag tokens
  | StartTag
  | EndTag

  // Data tokens
  | Character
  | Comment;

export type HtmlPattern<T extends HtmlToken> = Pattern<T>;

/**
 * @see https://www.w3.org/TR/html/syntax.html#data-state
 */
export const data: HtmlPattern<HtmlToken> = ({ next, location }) => {
  const start = location();

  if (next() === "<") {
    return tagOpen(start);
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-open-state
 */
const tagOpen: (start: Location) => HtmlPattern<HtmlToken> = start => (
  { next, ignore, backup, location },
  emit
) => {
  const char = next();

  if (char === "/") {
    return endTagOpen(start);
  }

  if (isAscii(char)) {
    backup();
    ignore();

    return tagName(start, {
      type: "start-tag",
      value: "",
      closed: false,
      attributes: {}
    });
  }

  emit({ type: "character", value: "<" }, start, location());
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#end-tag-open-state
 */
const endTagOpen: (start: Location) => HtmlPattern<HtmlToken> = start => (
  { peek, ignore },
  emit
) => {
  const char = peek();

  if (isAscii(char)) {
    ignore();
    return tagName(start, {
      type: "end-tag",
      value: ""
    });
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-name-state
 */
const tagName: (
  start: Location,
  tag: StartTag | EndTag
) => HtmlPattern<HtmlToken> = (start, tag) => (
  { next, peek, advance, result, location },
  emit
) => {
  const char = peek();

  if (char === "/" || char === ">") {
    assign(tag, { value: result() });
  }

  advance();

  if (char === "/") {
    return selfClosingStartTag(start, tag as StartTag);
  }

  if (char === ">") {
    emit(tag, start, location());
    return data;
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#self-closing-start-tag-state
 */
const selfClosingStartTag: (
  start: Location,
  tag: StartTag
) => HtmlPattern<HtmlToken> = (start, tag) => (
  { peek, location, advance },
  emit
) => {
  if (peek() === ">") {
    advance();
    assign(tag, { closed: true });
    emit(tag, start, location());
    return data;
  }
};

export const HtmlAlphabet: Alphabet<HtmlToken> = () => data;

export function lex(input: string): Array<HtmlToken> {
  return $lex(input, HtmlAlphabet);
}
