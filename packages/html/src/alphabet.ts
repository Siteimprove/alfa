import {
  set,
  isWhitespace,
  isAlpha,
  isAlphanumeric,
  isNumeric
} from "@alfa/util";
import * as Lang from "@alfa/lang";
import { Location, WithLocation } from "@alfa/lang";

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
  start: Location;
  tag: StartTag | EndTag | null;
  attribute: Attribute | null;
  comment: Comment | null;
};

export type Pattern = Lang.Pattern<Token, State>;

/**
 * @see https://www.w3.org/TR/html/syntax.html#data-state
 */
const initial: Pattern = (stream, emit, state, end) => {
  state.start = stream.location();

  const char = stream.next();

  if (char === "<") {
    return tagOpen;
  }

  if (char === null) {
    return end();
  }

  emit({
    type: "character",
    value: char,
    location: { start: state.start, end: stream.location() }
  });
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#tag-open-state
 */
const tagOpen: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === "!") {
    stream.advance();
    return markupDeclarationOpen;
  }

  if (char === "/") {
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

  if (char === "?") {
    state.comment = {
      type: "comment",
      value: ""
    };

    stream.ignore();

    return bogusComment;
  }

  const { start } = state;

  emit({
    type: "character",
    value: "<",
    location: { start, end: stream.location() }
  });

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

  if (stream.peek() === "-" && stream.peek(1) === "-") {
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

  if (char === "-") {
    stream.advance();
    return commentStartDash;
  }

  if (char === ">") {
    stream.advance();

    if (state.comment !== null) {
      emit(
        set(state.comment as WithLocation<Comment>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
    }

    return initial;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-start-dash-state
 */
const commentStartDash: Pattern = (stream, emit, state, done) => {
  const char = stream.peek();

  if (char === "-") {
    stream.advance();
    return commentEnd;
  }

  if (char === ">" || char === null) {
    stream.advance();

    if (state.comment !== null) {
      emit(
        set(state.comment as WithLocation<Comment>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
    }
  }

  if (char === ">") {
    return initial;
  }

  if (char === null) {
    return done();
  }

  if (state.comment !== null) {
    set(state.comment, "value", state.comment.value + "-");
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-state
 */
const comment: Pattern = (stream, emit, state, done) => {
  const char = stream.next();

  if (char === "<") {
    if (state.comment !== null) {
      set(state.comment, "value", state.comment.value + char);
    }

    return commentLessThanSign;
  }

  if (char === "-") {
    return commentEndDash;
  }

  if (char === null) {
    if (state.comment !== null) {
      emit(
        set(state.comment as WithLocation<Comment>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
    }
    return done();
  }

  if (state.comment !== null) {
    set(state.comment, "value", state.comment.value + char);
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-state
 */
const commentLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek();

  if (char === "!" || char === "<") {
    stream.advance();

    if (state.comment !== null) {
      set(state.comment, "value", state.comment.value + char);
    }
  }

  if (char === "!") {
    stream.advance();
    return commentLessThanSignBang;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-bang-state
 */
const commentLessThanSignBang: Pattern = stream => {
  if (stream.peek() === "-") {
    stream.advance();
    return commentLessThanSignBangDash;
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-bang-dash-state
 */
const commentLessThanSignBangDash: Pattern = stream => {
  if (stream.peek() === "-") {
    stream.advance();
    return commentEnd;
  }

  return commentEndDash;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-dash-state
 */
const commentEndDash: Pattern = (stream, emit, state, done) => {
  const char = stream.peek();

  if (char === "-" || char === null) {
    stream.advance();
  }

  if (char === "-") {
    return commentEnd;
  }

  if (char === null) {
    return done();
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-state
 */
const commentEnd: Pattern = (stream, emit, state, done) => {
  const char = stream.peek();

  if (char === ">") {
    stream.advance();

    if (state.comment !== null) {
      emit(
        set(state.comment as WithLocation<Comment>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
    }

    return initial;
  }

  if (char === "!") {
    stream.advance();
    return commentEndBang;
  }

  if (char === null) {
    return done();
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-bang-state
 */
const commentEndBang: Pattern = (stream, emit, state, done) => {
  const char = stream.peek();

  if (char === "-") {
    stream.advance();

    if (state.comment !== null) {
      set(state.comment, "value", state.comment.value + "-!");
    }

    return commentEndDash;
  }

  if (char === ">" || char === null) {
    if (state.comment !== null) {
      emit(
        set(state.comment as WithLocation<Comment>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
    }
  }

  if (char === ">") {
    return initial;
  }

  if (char === null) {
    return done();
  }

  if (state.comment !== null) {
    set(state.comment, "value", state.comment.value + "-!");
  }

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#end-tag-open-state
 */
const endTagOpen: Pattern = (stream, emit, state, done) => {
  const char = stream.peek();

  if (char === null) {
    emit({
      type: "character",
      value: "<",
      location: { start: state.start, end: stream.location() }
    });
    emit({
      type: "character",
      value: "/",
      location: { start: state.start, end: stream.location() }
    });
    return done();
  }

  if (isAlpha(char)) {
    stream.ignore();

    state.tag = {
      type: "end-tag",
      value: ""
    };

    return tagName;
  }

  if (char === ">") {
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
const tagName: Pattern = (stream, emit, state, done) => {
  const char = stream.peek();

  if (char === null) {
    return done();
  }

  if (isWhitespace(char) || char === "/" || char === ">") {
    if (state.tag !== null) {
      set(state.tag, "value", stream.result().join(""));
    }
  }

  stream.advance();

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === "/") {
    return selfClosingStartTag;
  }

  if (char === ">") {
    if (state.tag !== null) {
      emit(
        set(state.tag as WithLocation<StartTag | EndTag>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
    }

    return initial;
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#self-closing-start-tag-state
 */
const selfClosingStartTag: Pattern = (stream, emit, state, done) => {
  const char = stream.peek();

  if (char === ">") {
    stream.advance();

    if (state.tag !== null) {
      if (state.tag.type === "start-tag") {
        set(state.tag, "closed", true);
      }

      emit(
        set(state.tag as WithLocation<StartTag | EndTag>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
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
const beforeAttributeName: Pattern = (stream, emit, state) => {
  stream.accept(isWhitespace);

  const char = stream.peek();

  state.attribute = { name: "", value: "" };

  if (char === "/" || char === ">" || char === null) {
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

  if (char === null || isWhitespace(char) || char === "/" || char === ">") {
    if (state.attribute !== null) {
      set(state.attribute, "name", stream.result().join(""));
    }

    return afterAttributeName;
  }

  if (char === "=") {
    if (state.attribute !== null) {
      set(state.attribute, "name", stream.result().join(""));
    }

    stream.advance();

    return beforeAttributeValue;
  }

  stream.advance();
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-name-state
 */
const afterAttributeName: Pattern = (stream, emit, state, done) => {
  stream.accept(isWhitespace);

  const char = stream.peek();

  if (char === "/") {
    stream.advance();
    return selfClosingStartTag;
  }

  if (char === "=") {
    stream.advance();
    return beforeAttributeValue;
  }

  if (char === ">") {
    stream.advance();

    if (state.tag !== null) {
      emit(
        set(state.tag as WithLocation<StartTag | EndTag>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
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
const beforeAttributeValue: Pattern = (stream, emit) => {
  stream.accept(isWhitespace);

  const char = stream.peek();

  if (char === '"' || char === "'") {
    stream.advance();
  }

  stream.ignore();

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
const attributeValueDoubleQuoted: Pattern = (
  stream,
  emit,
  { attribute },
  done
) => {
  const char = stream.peek();

  if (char === '"') {
    if (attribute !== null) {
      set(attribute, "value", stream.result().join(""));
    }

    stream.advance();

    return afterAttributeValueQuoted;
  }

  stream.advance();

  if (char === null) {
    return done();
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-single-quoted-state
 */
const attributeValueSingleQuoted: Pattern = (
  stream,
  emit,
  { attribute },
  done
) => {
  const char = stream.peek();

  if (char === "'") {
    if (attribute !== null) {
      set(attribute, "value", stream.result().join(""));
    }

    stream.advance();

    return afterAttributeValueQuoted;
  }

  stream.advance();

  if (char === null) {
    return done();
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-unquoted-state
 */
const attributeValueUnquoted: Pattern = (stream, emit, state, done) => {
  const char = stream.peek();

  if (char === null) {
    return done();
  }

  if (isWhitespace(char) || char === ">") {
    if (state.attribute !== null) {
      set(state.attribute, "value", stream.result().join(""));
    }
  }

  stream.advance();

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === ">") {
    if (state.tag !== null) {
      emit(
        set(state.tag as WithLocation<StartTag | EndTag>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
    }

    return initial;
  }
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-value-quoted-state
 */
const afterAttributeValueQuoted: Pattern = (stream, emit, state, done) => {
  const char = stream.peek();

  if (char === null) {
    return done();
  }

  if (isWhitespace(char) || char === "/" || char === ">") {
    stream.advance();
  }

  if (isWhitespace(char)) {
    return beforeAttributeName;
  }

  if (char === "/") {
    return selfClosingStartTag;
  }

  if (char === ">") {
    if (state.tag !== null) {
      emit(
        set(state.tag as WithLocation<StartTag | EndTag>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
    }

    return initial;
  }

  return beforeAttributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#bogus-comment-state
 */
const bogusComment: Pattern = (stream, emit, state, done) => {
  const char = stream.next();

  if (char === ">" || char === null) {
    if (state.comment !== null) {
      set(
        state.comment,
        "value",
        state.comment.value + stream.result().join("")
      );
      emit(
        set(state.comment as WithLocation<Comment>, "location", {
          start: state.start,
          end: stream.location()
        })
      );
    }
  }

  if (char === ">") {
    return initial;
  }

  if (char === null) {
    return done();
  }
};

export const Alphabet: Lang.Alphabet<Token, State> = new Lang.Alphabet(
  initial,
  stream => ({
    start: stream.location(),
    tag: null,
    attribute: null,
    comment: null
  })
);
