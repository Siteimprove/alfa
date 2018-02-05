import {
  Pattern,
  Alphabet,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNumeric,
  isAscii,
  lex as $lex
} from "@alfa/lang";

export type Whitespace = Readonly<{ type: "whitespace" }>;

export type StartTag = Readonly<{ type: "start-tag"; value: string }>;
export type EndTag = Readonly<{ type: "end-tag"; value: string }>;
export type ClosingTag = Readonly<{ type: "closing-tag"; self?: true }>;

export type Comment = Readonly<{ type: "comment"; value: string }>;
export type Character = Readonly<{ type: "character"; value: string }>;

/**
 * @see https://www.w3.org/TR/html53/syntax.html#tokenization
 */
export type HtmlToken =
  | Whitespace

  // Tag tokens
  | StartTag
  | EndTag
  | ClosingTag

  // Data tokens
  | Comment
  | Character;

export type HtmlPattern<T extends HtmlToken> = Pattern<T>;

const whitespace: HtmlPattern<Whitespace> = ({ accept }) => {
  if (accept(isWhitespace)) {
    return { type: "whitespace" };
  }
};

const startTag: HtmlPattern<StartTag> = ({
  peek,
  next,
  accept,
  ignore,
  result
}) => {
  if (next() === "<") {
    ignore();

    if (
      isAscii(peek()) &&
      accept(char => char !== ">" && char !== "/" && !isWhitespace(char))
    ) {
      return {
        type: "start-tag",
        value: result()
      };
    }
  }
};

const endTag: HtmlPattern<EndTag> = ({
  peek,
  next,
  accept,
  ignore,
  result
}) => {
  if (next() === "<" && next() === "/") {
    ignore();

    if (
      isAscii(peek()) &&
      accept(char => char !== ">" && char !== "/" && !isWhitespace(char))
    ) {
      return {
        type: "end-tag",
        value: result()
      };
    }
  }
};

const closingTag: HtmlPattern<ClosingTag> = ({ peek, advance }) => {
  if (peek() === ">") {
    advance();
    return { type: "closing-tag" };
  }

  if (peek() === "/" && peek(1) === ">") {
    advance(2);
    return { type: "closing-tag", self: true };
  }
};

export const HtmlAlphabet: Alphabet<HtmlToken> = [
  whitespace,
  startTag,
  endTag,
  closingTag
];

export function lex(input: string): Array<HtmlToken> {
  return $lex(input, HtmlAlphabet);
}
