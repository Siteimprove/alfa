import { Mutable } from "@siteimprove/alfa-util";
import * as Lang from "@siteimprove/alfa-lang";
import { Command, Char, isWhitespace, isAlpha } from "@siteimprove/alfa-lang";

const { fromCharCode } = String;

export const enum TokenType {
  StartTag,
  EndTag,
  Comment,
  Character
}

export type Attribute = Readonly<{
  name: string;
  value: string;
}>;

export type StartTag = Readonly<{
  type: TokenType.StartTag;
  value: string;
  closed: boolean;
  attributes: Array<Attribute>;
}>;

export type EndTag = Readonly<{
  type: TokenType.EndTag;
  value: string;
}>;

export type Comment = Readonly<{
  type: TokenType.Comment;
  value: string;
}>;

export type Character = Readonly<{
  type: TokenType.Character;
  value: string;
}>;

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
  start: number;
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

  emit({ type: TokenType.Character, value: fromCharCode(char) });

  return initial;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-open-state
 */
const tagOpen: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.ExclamationMark) {
    stream.advance(1);
    return markupDeclarationOpen;
  }

  if (char === Char.Solidus) {
    stream.advance(1);
    return endTagOpen;
  }

  if (char !== null && isAlpha(char)) {
    state.start = stream.position;
    state.tag = {
      type: TokenType.StartTag,
      value: "",
      closed: false,
      attributes: []
    };

    return tagName;
  }

  if (char === Char.QuestionMark) {
    state.start = stream.position;
    state.comment = {
      type: TokenType.Comment,
      value: ""
    };

    return bogusComment;
  }

  emit({ type: TokenType.Character, value: "<" });

  return initial;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#markup-declaration-open-state
 */
const markupDeclarationOpen: Pattern = (stream, emit, state) => {
  state.comment = {
    type: TokenType.Comment,
    value: ""
  };

  if (
    stream.peek(0) === Char.HyphenMinus &&
    stream.peek(1) === Char.HyphenMinus
  ) {
    stream.advance(2);
    return commentStart;
  }

  state.start = stream.position;

  return bogusComment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-start-state
 */
const commentStart: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.HyphenMinus) {
    stream.advance(1);
    return commentStartDash;
  }

  if (char === Char.GreaterThanSign) {
    stream.advance(1);

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
  const char = stream.peek(0);

  if (char === Char.HyphenMinus) {
    stream.advance(1);
    return commentEnd;
  }

  if (char === Char.GreaterThanSign || char === null) {
    stream.advance(1);

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

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-state
 */
const commentLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.ExclamationMark || char === Char.LessThanSign) {
    stream.advance(1);

    if (state.comment !== null) {
      state.comment.value += fromCharCode(char);
    }
  }

  if (char === Char.ExclamationMark) {
    stream.advance(1);
    return commentLessThanSignBang;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-bang-state
 */
const commentLessThanSignBang: Pattern = stream => {
  if (stream.peek(0) === Char.HyphenMinus) {
    stream.advance(1);
    return commentLessThanSignBangDash;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-bang-dash-state
 */
const commentLessThanSignBangDash: Pattern = stream => {
  if (stream.peek(0) === Char.HyphenMinus) {
    stream.advance(1);
    return commentEnd;
  }

  return commentEndDash;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-dash-state
 */
const commentEndDash: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.HyphenMinus || char === null) {
    stream.advance(1);
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
  const char = stream.peek(0);

  if (char === Char.GreaterThanSign) {
    stream.advance(1);

    if (state.comment !== null) {
      emit(state.comment);
    }

    return initial;
  }

  if (char === Char.ExclamationMark) {
    stream.advance(1);
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
  const char = stream.peek(0);

  if (char === Char.HyphenMinus) {
    stream.advance(1);

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
  const char = stream.peek(0);

  if (char === null) {
    emit({ type: TokenType.Character, value: "<" });
    emit({ type: TokenType.Character, value: "/" });
    return Command.End;
  }

  if (isAlpha(char)) {
    state.start = stream.position;
    state.tag = {
      type: TokenType.EndTag,
      value: ""
    };

    return tagName;
  }

  if (char === Char.GreaterThanSign) {
    stream.advance(1);
    return initial;
  }

  state.start = stream.position;
  state.comment = {
    type: TokenType.Comment,
    value: ""
  };

  return bogusComment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-name-state
 */
const tagName: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === null) {
    return Command.End;
  }

  if (
    isWhitespace(char) ||
    char === Char.Solidus ||
    char === Char.GreaterThanSign
  ) {
    if (state.tag !== null) {
      state.tag.value = stream.reduce(
        state.start,
        stream.position,
        (value, char) => value + fromCharCode(char),
        ""
      );
    }
  }

  stream.advance(1);

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

  return tagName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#self-closing-start-tag-state
 */
const selfClosingStartTag: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.GreaterThanSign) {
    stream.advance(1);

    if (state.tag !== null) {
      if (state.tag.type === TokenType.StartTag) {
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

  const char = stream.peek(0);

  state.attribute = { name: "", value: "" };

  if (char === Char.Solidus || char === Char.GreaterThanSign || char === null) {
    return afterAttributeName;
  }

  if (state.tag !== null && state.tag.type === TokenType.StartTag) {
    state.tag.attributes.push(state.attribute);
  }

  state.start = stream.position;

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-name-state
 */
const attributeName: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (
    char === null ||
    isWhitespace(char) ||
    char === Char.Solidus ||
    char === Char.GreaterThanSign
  ) {
    if (state.attribute !== null) {
      state.attribute.name = stream.reduce(
        state.start,
        stream.position,
        (value, char) => value + fromCharCode(char),
        ""
      );
    }

    return afterAttributeName;
  }

  if (char === Char.EqualSign) {
    if (state.attribute !== null) {
      state.attribute.name = stream.reduce(
        state.start,
        stream.position,
        (value, char) => value + fromCharCode(char),
        ""
      );
    }

    stream.advance(1);

    return beforeAttributeValue;
  }

  stream.advance(1);

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-name-state
 */
const afterAttributeName: Pattern = (stream, emit, state) => {
  stream.accept(isWhitespace);

  const char = stream.peek(0);

  if (char === Char.Solidus) {
    stream.advance(1);
    return selfClosingStartTag;
  }

  if (char === Char.EqualSign) {
    stream.advance(1);
    return beforeAttributeValue;
  }

  if (char === Char.GreaterThanSign) {
    stream.advance(1);

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
const beforeAttributeValue: Pattern = (stream, emit, state) => {
  stream.accept(isWhitespace);

  const char = stream.peek(0);

  if (char === Char.QuotationMark || char === Char.Apostrophe) {
    stream.advance(1);
  }

  state.start = stream.position;

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
  const char = stream.peek(0);

  if (char === Char.QuotationMark) {
    if (state.attribute !== null) {
      state.attribute.value = stream.reduce(
        state.start,
        stream.position,
        (value, char) => value + fromCharCode(char),
        ""
      );
    }

    stream.advance(1);

    return afterAttributeValueQuoted;
  }

  stream.advance(1);

  if (char === null) {
    return Command.End;
  }

  return attributeValueDoubleQuoted;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-single-quoted-state
 */
const attributeValueSingleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.Apostrophe) {
    if (state.attribute !== null) {
      state.attribute.value = stream.reduce(
        state.start,
        stream.position,
        (value, char) => value + fromCharCode(char),
        ""
      );
    }

    stream.advance(1);

    return afterAttributeValueQuoted;
  }

  stream.advance(1);

  if (char === null) {
    return Command.End;
  }

  return attributeValueSingleQuoted;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-unquoted-state
 */
const attributeValueUnquoted: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === null) {
    return Command.End;
  }

  if (isWhitespace(char) || char === Char.GreaterThanSign) {
    if (state.attribute !== null) {
      state.attribute.value = stream.reduce(
        state.start,
        stream.position,
        (value, char) => value + fromCharCode(char),
        ""
      );
    }
  }

  stream.advance(1);

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === Char.GreaterThanSign) {
    if (state.tag !== null) {
      emit(state.tag);
    }

    return initial;
  }

  return attributeValueUnquoted;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-value-quoted-state
 */
const afterAttributeValueQuoted: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === null) {
    return Command.End;
  }

  if (
    isWhitespace(char) ||
    char === Char.Solidus ||
    char === Char.GreaterThanSign
  ) {
    stream.advance(1);
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
      state.comment.value += stream.reduce(
        state.start,
        stream.position,
        (value, char) => value + fromCharCode(char),
        ""
      );
      emit(state.comment);
    }
  }

  if (char === Char.GreaterThanSign) {
    return initial;
  }

  if (char === null) {
    return Command.End;
  }

  return bogusComment;
};

export const Alphabet: Lang.Alphabet<Token, State> = new Lang.Alphabet(
  initial,
  () => ({ start: 0, tag: null, attribute: null, comment: null })
);
