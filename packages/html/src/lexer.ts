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
  attributes: Array<Readonly<{ name: string; value: string }>>;
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

export type HtmlPattern = Pattern<HtmlToken>;

/**
 * @see https://www.w3.org/TR/html/syntax.html#data-state
 */
export const data: HtmlPattern = ({ next, location }, emit, end) => {
  const start = location();
  const char = next();

  if (char === "<") {
    return tagOpen(start);
  }

  if (char === null) {
    return end();
  }

  emit({ type: "character", value: char }, start, location());
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-open-state
 */
const tagOpen: (start: Location) => HtmlPattern = start => (
  { peek, next, ignore, advance, location },
  emit
) => {
  const char = peek();

  if (char === "/") {
    advance();
    return endTagOpen(start);
  }

  if (isAscii(char)) {
    ignore();
    return tagName(start, {
      type: "start-tag",
      value: "",
      closed: false,
      attributes: []
    });
  }

  emit({ type: "character", value: "<" }, start, location());

  return data;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#end-tag-open-state
 */
const endTagOpen: (start: Location) => HtmlPattern = start => (
  { peek, advance, ignore, location },
  emit
) => {
  const char = peek();

  if (char === ">") {
    advance();
    return data;
  }

  if (isAscii(char)) {
    ignore();
    return tagName(start, {
      type: "end-tag",
      value: ""
    });
  }

  return data;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-name-state
 */
const tagName: (start: Location, tag: StartTag | EndTag) => HtmlPattern = (
  start,
  tag
) => ({ next, peek, advance, result, location }, emit, done) => {
  const char = peek();

  advance();

  if (isWhitespace(char)) {
    return beforeAttributeName(start, tag);
  }

  if (char === "/") {
    return selfClosingStartTag(start, tag as StartTag);
  }

  if (char === ">") {
    emit(tag, start, location());
    return data;
  }

  if (char === null) {
    return done();
  }

  assign(tag, { value: tag.value + char });
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#self-closing-start-tag-state
 */
const selfClosingStartTag: (start: Location, tag: StartTag) => HtmlPattern = (
  start,
  tag
) => ({ peek, location, advance }, emit) => {
  if (peek() === ">") {
    advance();
    assign(tag, { closed: true });
    emit(tag, start, location());
    return data;
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#before-attribute-name-state
 */
const beforeAttributeName: (
  start: Location,
  tag: StartTag | EndTag
) => HtmlPattern = (start, tag) => ({ peek, accept, advance }, emit) => {
  accept(isWhitespace);

  const char = peek();

  const attribute = { name: "", value: "" };

  if (char === "/" || char === ">" || char === null) {
    return afterAttributeName(start, tag, attribute);
  }

  if (tag.type === "start-tag") {
    tag.attributes.push(attribute);
  }

  return attributeName(start, tag, attribute);
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-name-state
 */
const attributeName: (
  start: Location,
  tag: StartTag | EndTag,
  attribute: { name: string; value: string }
) => HtmlPattern = (start, tag, attribute) => ({ peek, advance }, emit) => {
  const char = peek();

  if (isWhitespace(char) || char === "/" || char === ">" || char === null) {
    return afterAttributeName(start, tag, attribute);
  }

  advance();

  if (char === "=") {
    return beforeAttributeValue(start, tag, attribute);
  }

  attribute.name += char;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-name-state
 */
const afterAttributeName: (
  start: Location,
  tag: StartTag | EndTag,
  attribute: { name: string; value: string }
) => HtmlPattern = (start, tag, attribute) => (
  { peek, advance, accept, location },
  emit,
  done
) => {
  accept(isWhitespace);

  const char = peek();

  if (char === "/") {
    advance();
    return selfClosingStartTag(start, tag as StartTag);
  }

  if (char === "=") {
    advance();
    return beforeAttributeValue(start, tag, attribute);
  }

  if (char === ">") {
    advance();
    emit(tag, start, location());
    return data;
  }

  if (char === null) {
    return done();
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#before-attribute-value-state
 */
const beforeAttributeValue: (
  start: Location,
  tag: StartTag | EndTag,
  attribute: { name: string; value: string }
) => HtmlPattern = (start, tag, attribute) => ({ peek, accept, advance }) => {
  accept(isWhitespace);

  const char = peek();

  let mark: '"' | "'" | null = null;

  if (char === '"' || char === "'") {
    advance();
    mark = char;
  }

  return attributeValue(start, tag, attribute, mark);
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-double-quoted-state
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-single-quoted-state
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-unquoted-state
 */
const attributeValue: (
  start: Location,
  tag: StartTag | EndTag,
  attribute: { name: string; value: string },
  mark: '"' | "'" | null
) => HtmlPattern = (start, tag, attribute, mark) => (
  { next, location },
  emit,
  done
) => {
  const char = next();

  if (char === null) {
    return done();
  }

  if (char === mark) {
    return afterAttributeValue(start, tag, attribute, mark);
  }

  if (mark === null && isWhitespace(char)) {
    return beforeAttributeName(start, tag);
  }

  if (mark === null && char === ">") {
    emit(tag, start, location());
    return data;
  }

  attribute.value += char;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-value-quoted-state
 */
const afterAttributeValue: (
  start: Location,
  tag: StartTag | EndTag,
  attribute: { name: string; value: string },
  mark: '"' | "'"
) => HtmlPattern = (start, tag, attribute, mark) => (
  { peek, accept, advance, location },
  emit,
  done
) => {
  const char = peek();

  if (isWhitespace(char)) {
    advance();
    return beforeAttributeName(start, tag);
  }

  if (char === "/") {
    advance();
    return selfClosingStartTag(start, tag as StartTag);
  }

  if (char === ">") {
    advance();
    emit(tag, start, location());
    return data;
  }

  if (char === null) {
    return done();
  }

  return beforeAttributeName(start, tag);
};

export const HtmlAlphabet: Alphabet<HtmlToken> = () => data;

export function lex(input: string): Array<HtmlToken> {
  return $lex(input, HtmlAlphabet);
}
