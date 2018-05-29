import { Mutable } from "@siteimprove/alfa-util";
import * as Lang from "@siteimprove/alfa-lang";
import {
  Command,
  Char,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNumeric
} from "@siteimprove/alfa-lang";

const { fromCharCode } = String;

export type Attribute = Readonly<{
  name: string;
  value: string;
}>;

export type StartTag = Readonly<{
  type: "start-tag";
  value: string;
  closed: boolean;
  attributes: Array<Attribute>;
}>;

export type EndTag = Readonly<{
  type: "end-tag";
  value: string;
}>;

export type Comment = Readonly<{ type: "comment"; value: string }>;
export type Character = Readonly<{ type: "character"; value: string }>;

/**
 * @see https://www.w3.org/TR/html/syntax.html#tokenization
 */
export type Token =
  // Tag tokens
  | StartTag
  | EndTag

  // Data tokens
  | Character
  | Comment;

export type State = {
  tag: Mutable<StartTag | EndTag> | null;
  attribute: Mutable<Attribute> | null;
  comment: Mutable<Comment> | null;
};

export type Pattern = Lang.Pattern<Token, State>;

/**
 * @see https://www.w3.org/TR/html/syntax.html#data-state
 */
const initial: Pattern = (stream, emit, state) => {
  const char = stream.next();

  if (char === Char.LessThanSign) {
    return tagOpen;
  }

  if (char === null) {
    return Command.End;
  }

  emit({ type: "character", value: fromCharCode(char) });
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-open-state
 */
const tagOpen: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.ExclamationMark) {
    stream.advance();
    return markupDeclarationOpen;
  }

  if (char === Char.Solidus) {
    stream.advance();
    return endTagOpen;
  }

  if (char !== null && isAlpha(char)) {
    stream.ignore();

    state.tag = {
      type: "start-tag",
      value: "",
      closed: false,
      attributes: []
    };

    return tagName;
  }

  if (char === Char.QuestionMark) {
    state.comment = {
      type: "comment",
      value: ""
    };

    stream.ignore();

    return bogusComment;
  }

  emit({ type: "character", value: "<" });

  return initial;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#markup-declaration-open-state
 */
const markupDeclarationOpen: Pattern = (stream, emit, state) => {
  state.comment = {
    type: "comment",
    value: ""
  };

  if (
    stream.peek() === Char.HyphenMinus &&
    stream.peek(1) === Char.HyphenMinus
  ) {
    stream.advance(2);
    return commentStart;
  }

  stream.ignore();

  return bogusComment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-start-state
 */
const commentStart: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.HyphenMinus) {
    stream.advance();
    return commentStartDash;
  }

  if (char === Char.GreaterThanSign) {
    stream.advance();

    if (state.comment !== null) {
      emit(state.comment);
    }

    return initial;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-start-dash-state
 */
const commentStartDash: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.HyphenMinus) {
    stream.advance();
    return commentEnd;
  }

  if (char === Char.GreaterThanSign || char === null) {
    stream.advance();

    if (state.comment !== null) {
      emit(state.comment);
    }
  }

  if (char === Char.GreaterThanSign) {
    return initial;
  }

  if (char === null) {
    return Command.End;
  }

  if (state.comment !== null) {
    state.comment.value += "-";
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-state
 */
const comment: Pattern = (stream, emit, state) => {
  const char = stream.next();

  if (char === Char.LessThanSign) {
    if (state.comment !== null) {
      state.comment.value += fromCharCode(char);
    }

    return commentLessThanSign;
  }

  if (char === Char.HyphenMinus) {
    return commentEndDash;
  }

  if (char === null) {
    if (state.comment !== null) {
      emit(state.comment);
    }
    return Command.End;
  }

  if (state.comment !== null) {
    state.comment.value += fromCharCode(char);
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-state
 */
const commentLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.ExclamationMark || char === Char.LessThanSign) {
    stream.advance();

    if (state.comment !== null) {
      state.comment.value += fromCharCode(char);
    }
  }

  if (char === Char.ExclamationMark) {
    stream.advance();
    return commentLessThanSignBang;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-bang-state
 */
const commentLessThanSignBang: Pattern = stream => {
  if (stream.peek() === Char.HyphenMinus) {
    stream.advance();
    return commentLessThanSignBangDash;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-bang-dash-state
 */
const commentLessThanSignBangDash: Pattern = stream => {
  if (stream.peek() === Char.HyphenMinus) {
    stream.advance();
    return commentEnd;
  }

  return commentEndDash;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-dash-state
 */
const commentEndDash: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.HyphenMinus || char === null) {
    stream.advance();
  }

  if (char === Char.HyphenMinus) {
    return commentEnd;
  }

  if (char === null) {
    return Command.End;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-state
 */
const commentEnd: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.GreaterThanSign) {
    stream.advance();

    if (state.comment !== null) {
      emit(state.comment);
    }

    return initial;
  }

  if (char === Char.ExclamationMark) {
    stream.advance();
    return commentEndBang;
  }

  if (char === null) {
    return Command.End;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-bang-state
 */
const commentEndBang: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.HyphenMinus) {
    stream.advance();

    if (state.comment !== null) {
      state.comment.value += "-!";
    }

    return commentEndDash;
  }

  if (char === Char.GreaterThanSign || char === null) {
    if (state.comment !== null) {
      emit(state.comment);
    }
  }

  if (char === Char.GreaterThanSign) {
    return initial;
  }

  if (char === null) {
    return Command.End;
  }

  if (state.comment !== null) {
    state.comment.value += "-!";
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#end-tag-open-state
 */
const endTagOpen: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === null) {
    emit({ type: "character", value: "<" });
    emit({ type: "character", value: "/" });
    return Command.End;
  }

  if (isAlpha(char)) {
    stream.ignore();

    state.tag = {
      type: "end-tag",
      value: ""
    };

    return tagName;
  }

  if (char === Char.GreaterThanSign) {
    stream.advance();
    return initial;
  }

  state.comment = {
    type: "comment",
    value: ""
  };

  stream.ignore();

  return bogusComment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-name-state
 */
const tagName: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === null) {
    return Command.End;
  }

  if (
    isWhitespace(char) ||
    char === Char.Solidus ||
    char === Char.GreaterThanSign
  ) {
    if (state.tag !== null) {
      state.tag.value = fromCharCode(...stream.result());
    }
  }

  stream.advance();

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === Char.Solidus) {
    return selfClosingStartTag;
  }

  if (char === Char.GreaterThanSign) {
    if (state.tag !== null) {
      emit(state.tag);
    }

    return initial;
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#self-closing-start-tag-state
 */
const selfClosingStartTag: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.GreaterThanSign) {
    stream.advance();

    if (state.tag !== null) {
      if (state.tag.type === "start-tag") {
        state.tag.closed = true;
      }

      emit(state.tag);
    }

    return initial;
  }

  if (char === null) {
    return Command.End;
  }

  return beforeAttributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#before-attribute-name-state
 */
const beforeAttributeName: Pattern = (stream, emit, state) => {
  stream.accept(isWhitespace);

  const char = stream.peek();

  state.attribute = { name: "", value: "" };

  if (char === Char.Solidus || char === Char.GreaterThanSign || char === null) {
    return afterAttributeName;
  }

  if (state.tag !== null && state.tag.type === "start-tag") {
    state.tag.attributes.push(state.attribute);
  }

  stream.ignore();

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-name-state
 */
const attributeName: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (
    char === null ||
    isWhitespace(char) ||
    char === Char.Solidus ||
    char === Char.GreaterThanSign
  ) {
    if (state.attribute !== null) {
      state.attribute.name = fromCharCode(...stream.result());
    }

    return afterAttributeName;
  }

  if (char === Char.EqualSign) {
    if (state.attribute !== null) {
      state.attribute.name = fromCharCode(...stream.result());
    }

    stream.advance();

    return beforeAttributeValue;
  }

  stream.advance();
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-name-state
 */
const afterAttributeName: Pattern = (stream, emit, state) => {
  stream.accept(isWhitespace);

  const char = stream.peek();

  if (char === Char.Solidus) {
    stream.advance();
    return selfClosingStartTag;
  }

  if (char === Char.EqualSign) {
    stream.advance();
    return beforeAttributeValue;
  }

  if (char === Char.GreaterThanSign) {
    stream.advance();

    if (state.tag !== null) {
      emit(state.tag);
    }

    return initial;
  }

  if (char === null) {
    return Command.End;
  }

  state.attribute = { name: "", value: "" };

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#before-attribute-value-state
 */
const beforeAttributeValue: Pattern = (stream, emit) => {
  stream.accept(isWhitespace);

  const char = stream.peek();

  if (char === Char.QuotationMark || char === Char.Apostrophe) {
    stream.advance();
  }

  stream.ignore();

  if (char === Char.QuotationMark) {
    return attributeValueDoubleQuoted;
  }

  if (char === Char.Apostrophe) {
    return attributeValueSingleQuoted;
  }

  return attributeValueUnquoted;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-double-quoted-state
 */
const attributeValueDoubleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.QuotationMark) {
    if (state.attribute !== null) {
      state.attribute.value = fromCharCode(...stream.result());
    }

    stream.advance();

    return afterAttributeValueQuoted;
  }

  stream.advance();

  if (char === null) {
    return Command.End;
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-single-quoted-state
 */
const attributeValueSingleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === Char.Apostrophe) {
    if (state.attribute !== null) {
      state.attribute.value = fromCharCode(...stream.result());
    }

    stream.advance();

    return afterAttributeValueQuoted;
  }

  stream.advance();

  if (char === null) {
    return Command.End;
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-unquoted-state
 */
const attributeValueUnquoted: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === null) {
    return Command.End;
  }

  if (isWhitespace(char) || char === Char.GreaterThanSign) {
    if (state.attribute !== null) {
      state.attribute.value = fromCharCode(...stream.result());
    }
  }

  stream.advance();

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === Char.GreaterThanSign) {
    if (state.tag !== null) {
      emit(state.tag);
    }

    return initial;
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-value-quoted-state
 */
const afterAttributeValueQuoted: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === null) {
    return Command.End;
  }

  if (
    isWhitespace(char) ||
    char === Char.Solidus ||
    char === Char.GreaterThanSign
  ) {
    stream.advance();
  }

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === Char.Solidus) {
    return selfClosingStartTag;
  }

  if (char === Char.GreaterThanSign) {
    if (state.tag !== null) {
      emit(state.tag);
    }

    return initial;
  }

  return beforeAttributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#bogus-comment-state
 */
const bogusComment: Pattern = (stream, emit, state) => {
  const char = stream.next();

  if (char === Char.GreaterThanSign || char === null) {
    if (state.comment !== null) {
      state.comment.value += fromCharCode(...stream.result());
      emit(state.comment);
    }
  }

  if (char === Char.GreaterThanSign) {
    return initial;
  }

  if (char === null) {
    return Command.End;
  }
};

export const Alphabet: Lang.Alphabet<Token, State> = new Lang.Alphabet(
  initial,
  () => ({ tag: null, attribute: null, comment: null })
);
