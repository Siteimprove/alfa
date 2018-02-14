import {
  Pattern,
  Alphabet,
  Location,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNumeric,
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

export type HtmlState = {
  start: Location;
  tag: StartTag | EndTag | null;
  attribute: { name: string; value: string } | null;
};

export type HtmlPattern = Pattern<HtmlToken, HtmlState>;

/**
 * @see https://www.w3.org/TR/html/syntax.html#data-state
 */
export const initial: HtmlPattern = ({ next, location }, emit, state, end) => {
  state.start = location();

  const char = next();

  if (char === "<") {
    return tagOpen;
  }

  if (char === null) {
    return end();
  }

  emit({ type: "character", value: char }, state.start, location());
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-open-state
 */
const tagOpen: HtmlPattern = (
  { peek, next, ignore, advance, location },
  emit,
  state
) => {
  const char = peek();

  if (char === "/") {
    advance();
    return endTagOpen;
  }

  if (isAlpha(char)) {
    ignore();

    state.tag = {
      type: "start-tag",
      value: "",
      closed: false,
      attributes: []
    };

    return tagName;
  }

  emit({ type: "character", value: "<" }, state.start, location());

  return initial;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#end-tag-open-state
 */
const endTagOpen: HtmlPattern = (
  { peek, advance, ignore, location },
  emit,
  state,
  done
) => {
  const char = peek();

  if (isAlpha(char)) {
    ignore();

    state.tag = {
      type: "end-tag",
      value: ""
    };

    return tagName;
  }

  if (char === ">") {
    advance();
    return initial;
  }

  if (char === null) {
    emit({ type: "character", value: "<" }, state.start, location());
    emit({ type: "character", value: "/" }, state.start, location());
    return done();
  }

  ignore();

  return bogusComment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-name-state
 */
const tagName: HtmlPattern = (
  { next, peek, advance, result, location },
  emit,
  { start, tag },
  done
) => {
  const char = peek();

  if (isWhitespace(char) || char === "/" || char === ">") {
    assign(tag, { value: result() });
  }

  advance();

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === "/") {
    return selfClosingStartTag;
  }

  if (char === ">") {
    if (tag !== null) {
      emit(tag, start, location());
    }
    return initial;
  }

  if (char === null) {
    return done();
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#self-closing-start-tag-state
 */
const selfClosingStartTag: HtmlPattern = (
  { peek, location, advance },
  emit,
  { start, tag },
  done
) => {
  const char = peek();

  if (char === ">") {
    advance();
    assign(tag, { closed: true });
    if (tag !== null) {
      emit(tag, start, location());
    }
    return initial;
  }

  if (char === null) {
    return done();
  }

  return beforeAttributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#before-attribute-name-state
 */
const beforeAttributeName: HtmlPattern = (
  { peek, ignore, accept, advance },
  emit,
  state
) => {
  accept(isWhitespace);

  const char = peek();

  state.attribute = { name: "", value: "" };

  if (char === "/" || char === ">" || char === null) {
    return afterAttributeName;
  }

  const { tag } = state;

  if (tag !== null && tag.type === "start-tag") {
    tag.attributes.push(state.attribute);
  }

  ignore();

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-name-state
 */
const attributeName: HtmlPattern = (
  { peek, result, advance },
  emit,
  { start, tag, attribute }
) => {
  const char = peek();

  if (isWhitespace(char) || char === "/" || char === ">" || char === null) {
    assign(attribute, { name: result() });
    return afterAttributeName;
  }

  if (char === "=") {
    assign(attribute, { name: result() });
    advance();
    return beforeAttributeValue;
  }

  advance();
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-name-state
 */
const afterAttributeName: HtmlPattern = (
  { peek, advance, accept, location },
  emit,
  state,
  done
) => {
  accept(isWhitespace);

  const char = peek();

  if (char === "/") {
    advance();
    return selfClosingStartTag;
  }

  if (char === "=") {
    advance();
    return beforeAttributeValue;
  }

  const { tag } = state;

  if (char === ">") {
    advance();
    if (tag !== null) {
      emit(tag, state.start, location());
    }
    return initial;
  }

  if (char === null) {
    return done();
  }

  state.attribute = { name: "", value: "" };

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#before-attribute-value-state
 */
const beforeAttributeValue: HtmlPattern = (
  { peek, accept, advance, ignore },
  emit
) => {
  accept(isWhitespace);

  const char = peek();

  if (char === '"' || char === "'") {
    advance();
  }

  ignore();

  if (char === '"') {
    return attributeValueDoubleQuoted;
  }

  if (char === "'") {
    return attributeValueSingleQuoted;
  }

  return attributeValueUnquoted;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-double-quoted-state
 */
const attributeValueDoubleQuoted: HtmlPattern = (
  { peek, advance, result },
  emit,
  { attribute },
  done
) => {
  const char = peek();

  if (char === '"') {
    assign(attribute, { value: result() });
    advance();
    return afterAttributeValueQuoted;
  }

  advance();

  if (char === null) {
    return done();
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-single-quoted-state
 */
const attributeValueSingleQuoted: HtmlPattern = (
  { peek, advance, result },
  emit,
  { attribute },
  done
) => {
  const char = peek();

  if (char === "'") {
    assign(attribute, { value: result() });
    advance();
    return afterAttributeValueQuoted;
  }

  advance();

  if (char === null) {
    return done();
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-unquoted-state
 */
const attributeValueUnquoted: HtmlPattern = (
  { peek, advance, result, location },
  emit,
  { start, tag, attribute },
  done
) => {
  const char = peek();

  if (isWhitespace(char) || char === ">") {
    assign(attribute, { value: result() });
  }

  advance();

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === ">") {
    if (tag !== null) {
      emit(tag, start, location());
    }
    return initial;
  }

  if (char === null) {
    return done();
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-value-quoted-state
 */
const afterAttributeValueQuoted: HtmlPattern = (
  { peek, accept, advance, location },
  emit,
  { start, tag },
  done
) => {
  const char = peek();

  if (isWhitespace(char) || char === "/" || char === ">") {
    advance();
  }

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === "/") {
    return selfClosingStartTag;
  }

  if (char === ">") {
    if (tag !== null) {
      emit(tag, start, location());
    }
    return initial;
  }

  if (char === null) {
    return done();
  }

  return beforeAttributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#bogus-comment-state
 */
const bogusComment: HtmlPattern = (
  { next, result, location },
  emit,
  { start },
  done
) => {
  const char = next();

  if (char === ">" || char === null) {
    emit({ type: "comment", value: result() }, start, location());
  }

  if (char === ">") {
    return initial;
  }

  if (char === null) {
    return done();
  }
};

export const HtmlAlphabet: Alphabet<HtmlToken, HtmlState> = ({ location }) => [
  initial,
  { start: location(), tag: null, attribute: null }
];

export function lex(input: string): Array<HtmlToken> {
  return $lex(input, HtmlAlphabet);
}
