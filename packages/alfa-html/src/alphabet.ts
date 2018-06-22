import { Mutable } from "@siteimprove/alfa-util";
import * as Lang from "@siteimprove/alfa-lang";
import { Command, Char, isAlpha } from "@siteimprove/alfa-lang";

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
  tag: Mutable<StartTag | EndTag> | null;
  attribute: Mutable<Attribute> | null;
  comment: Mutable<Comment> | null;
  return: Pattern | null;
};

export type Pattern = Lang.Pattern<Token, State>;

/**
 * @see https://www.w3.org/TR/html/syntax.html#data-state
 */
const data: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    // case Char.Ampersand:
    //   state.return = data;
    //   return characterReference;

    case Char.LessThanSign:
      return tagOpen;

    case null:
      return Command.End;
  }

  emit({ type: TokenType.Character, value: fromCharCode(char) });
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-open-state
 */
const tagOpen: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.ExclamationMark:
      stream.advance(1);
      return markupDeclarationOpen;

    case Char.Solidus:
      stream.advance(1);
      return endTagOpen;

    case Char.QuestionMark:
      state.comment = {
        type: TokenType.Comment,
        value: ""
      };

      return bogusComment;
  }

  if (char !== null && isAlpha(char)) {
    state.tag = {
      type: TokenType.StartTag,
      value: "",
      closed: false,
      attributes: []
    };

    return tagName;
  }

  emit({ type: TokenType.Character, value: "<" });

  return data;
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
    state.tag = {
      type: TokenType.EndTag,
      value: ""
    };

    return tagName;
  }

  if (char === Char.GreaterThanSign) {
    stream.advance(1);
    return data;
  }

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
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return beforeAttributeName;

    case Char.Solidus:
      return selfClosingStartTag;

    case Char.GreaterThanSign:
      if (state.tag) {
        emit(state.tag);
      }

      return data;

    case Char.Null:
      if (state.tag !== null) {
        state.tag.value += "\ufffd";
      }
      break;

    case null:
      return Command.End;
  }

  if (state.tag) {
    if (isAlpha(char)) {
      state.tag.value += fromCharCode(char).toLowerCase();
    } else {
      state.tag.value += fromCharCode(char);
    }
  }

  return tagName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#before-attribute-name-state
 */
const beforeAttributeName: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      stream.advance(1);
      return beforeAttributeName;

    case Char.Solidus:
    case Char.GreaterThanSign:
    case null:
      return afterAttributeName;

    case Char.EqualSign:
      stream.advance(1);

      state.attribute = { name: fromCharCode(char), value: "" };

      if (state.tag !== null && state.tag.type === TokenType.StartTag) {
        state.tag.attributes.push(state.attribute);
      }

      return attributeName;
  }

  state.attribute = { name: "", value: "" };

  if (state.tag !== null && state.tag.type === TokenType.StartTag) {
    state.tag.attributes.push(state.attribute);
  }

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-name-state
 */
const attributeName: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
    case Char.Solidus:
    case Char.GreaterThanSign:
    case null:
      return afterAttributeName;

    case Char.EqualSign:
      stream.advance(1);
      return beforeAttributeValue;

    case Char.Null:
      stream.advance(1);

      if (state.attribute !== null) {
        state.attribute.name += "\ufffd";
      }

      return attributeName;
  }

  stream.advance(1);

  if (state.attribute !== null) {
    state.attribute.name += fromCharCode(char);
  }

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-name-state
 */
const afterAttributeName: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      stream.advance(1);
      return;

    case Char.Solidus:
      stream.advance(1);
      return selfClosingStartTag;

    case Char.EqualSign:
      stream.advance(1);
      return beforeAttributeValue;

    case Char.GreaterThanSign:
      stream.advance(1);

      if (state.tag) {
        emit(state.tag);
      }

      return data;

    case null:
      return Command.End;
  }

  state.attribute = { name: "", value: "" };

  if (state.tag !== null && state.tag.type === TokenType.StartTag) {
    state.tag.attributes.push(state.attribute);
  }

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#before-attribute-value-state
 */
const beforeAttributeValue: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      stream.advance(1);
      return;

    case Char.QuotationMark:
      stream.advance(1);
      return attributeValueDoubleQuoted;

    case Char.Apostrophe:
      stream.advance(1);
      return attributeValueSingleQuoted;
  }

  return attributeValueUnquoted;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-double-quoted-state
 */
const attributeValueDoubleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.QuotationMark:
      return afterAttributeValueQuoted;

    // case Char.Ampersand:
    //   state.return = attributeValueDoubleQuoted;
    //   return characterReference;

    case Char.Null:
      if (state.attribute !== null) {
        state.attribute.value += "\ufffd";
      }
      return;

    case null:
      return Command.End;
  }

  if (state.attribute !== null) {
    state.attribute.value += fromCharCode(char);
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-single-quoted-state
 */
const attributeValueSingleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.Apostrophe:
      return afterAttributeValueQuoted;

    // case Char.Ampersand:
    //   state.return = attributeValueSingleQuoted;
    //   return characterReference;

    case Char.Null:
      if (state.attribute !== null) {
        state.attribute.value += "\ufffd";
      }
      return;

    case null:
      return Command.End;
  }

  if (state.attribute !== null) {
    state.attribute.value += fromCharCode(char);
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-unquoted-state
 */
const attributeValueUnquoted: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return beforeAttributeName;

    // case Char.Ampersand:
    //   state.return = attributeValueUnquoted;
    //   return characterReference;

    case Char.GreaterThanSign:
      if (state.tag !== null) {
        emit(state.tag);
      }

      return data;

    case Char.Null:
      if (state.attribute !== null) {
        state.attribute.value += "\ufffd";
      }
      return;

    case null:
      return Command.End;
  }

  if (state.attribute !== null) {
    state.attribute.value += fromCharCode(char);
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-value-quoted-state
 */
const afterAttributeValueQuoted: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      stream.advance(1);
      return beforeAttributeName;

    case Char.Solidus:
      stream.advance(1);
      return selfClosingStartTag;

    case Char.GreaterThanSign:
      stream.advance(1);

      if (state.tag !== null) {
        emit(state.tag);
      }

      return data;

    case null:
      return Command.End;
  }

  return beforeAttributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#self-closing-start-tag-state
 */
const selfClosingStartTag: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.GreaterThanSign:
      stream.advance(1);

      if (state.tag !== null) {
        if (state.tag.type === TokenType.StartTag) {
          state.tag.closed = true;
        }

        emit(state.tag);
      }

      return data;

    case null:
      return Command.End;
  }

  return beforeAttributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#bogus-comment-state
 */
const bogusComment: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.GreaterThanSign:
      if (state.comment !== null) {
        emit(state.comment);
      }

      return data;

    case null:
      if (state.comment !== null) {
        emit(state.comment);
      }

      return Command.End;

    case Char.Null:
      if (state.comment !== null) {
        state.comment.value += "\ufffd";
      }
      break;

    default:
      if (state.comment !== null) {
        state.comment.value += fromCharCode(char);
      }
  }
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

  return bogusComment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-start-state
 */
const commentStart: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.HyphenMinus:
      stream.advance(1);
      return commentStartDash;

    case Char.GreaterThanSign:
      stream.advance(1);

      if (state.comment !== null) {
        emit(state.comment);
      }

      return data;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-start-dash-state
 */
const commentStartDash: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.HyphenMinus:
      stream.advance(1);
      return commentEnd;

    case Char.GreaterThanSign:
      stream.advance(1);

      if (state.comment !== null) {
        emit(state.comment);
      }

      return data;

    case null:
      stream.advance(1);

      if (state.comment !== null) {
        emit(state.comment);
      }

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

  switch (char) {
    case Char.LessThanSign:
      if (state.comment !== null) {
        state.comment.value += fromCharCode(char);
      }

      return commentLessThanSign;

    case Char.HyphenMinus:
      return commentEndDash;

    case Char.Null:
      if (state.comment !== null) {
        state.comment.value += "\ufffd";
      }
      break;

    case null:
      if (state.comment !== null) {
        emit(state.comment);
      }
      return Command.End;

    default:
      if (state.comment !== null) {
        state.comment.value += fromCharCode(char);
      }
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-state
 */
const commentLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.ExclamationMark:
      stream.advance(1);

      if (state.comment !== null) {
        state.comment.value += fromCharCode(char);
      }

      return commentLessThanSignBang;

    case Char.LessThanSign:
      stream.advance(1);

      if (state.comment !== null) {
        state.comment.value += fromCharCode(char);
      }

      return commentLessThanSign;
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
    return commentLessThanSignBangDashDash;
  }

  return commentEndDash;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-bang-dash-dash-state
 */
const commentLessThanSignBangDashDash: Pattern = stream => {
  return commentEnd;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-dash-state
 */
const commentEndDash: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.HyphenMinus:
      stream.advance(1);
      return commentEnd;

    case null:
      if (state.comment !== null) {
        emit(state.comment);
      }

      return Command.End;
  }

  if (state.comment !== null) {
    state.comment.value += "-";
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-state
 */
const commentEnd: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.GreaterThanSign:
      stream.advance(1);

      if (state.comment !== null) {
        emit(state.comment);
      }

      return data;

    case Char.ExclamationMark:
      stream.advance(1);
      return commentEndBang;

    case Char.HyphenMinus:
      stream.advance(1);

      if (state.comment !== null) {
        state.comment.value += "-";
      }

      return commentEnd;

    case null:
      if (state.comment !== null) {
        emit(state.comment);
      }

      return Command.End;
  }

  if (state.comment !== null) {
    state.comment.value += "--";
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-bang-state
 */
const commentEndBang: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.HyphenMinus:
      stream.advance(1);

      if (state.comment !== null) {
        state.comment.value += "-!";
      }

      return commentEndDash;

    case Char.GreaterThanSign:
      stream.advance(1);

      if (state.comment !== null) {
        emit(state.comment);
      }

      return data;

    case null:
      if (state.comment !== null) {
        emit(state.comment);
      }

      return Command.End;
  }

  if (state.comment !== null) {
    state.comment.value += "-!";
  }

  return comment;
};

export const Alphabet: Lang.Alphabet<Token, State> = new Lang.Alphabet(
  data,
  () => ({
    start: 0,
    tag: null,
    attribute: null,
    comment: null,
    return: null
  })
);
