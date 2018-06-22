import { Mutable, keys } from "@siteimprove/alfa-util";
import * as Lang from "@siteimprove/alfa-lang";
import {
  Command,
  Char,
  isBetween,
  isAlpha,
  isHex,
  isNumeric,
  isAlphanumeric
} from "@siteimprove/alfa-lang";
import { Entity, Entities } from "./entities";
import { PrefixTree } from "./prefix-tree";

const entities: PrefixTree<Entity> = new PrefixTree();

for (const key of keys(Entities)) {
  const entity = Entities[key];

  entities.set(key as string, entity);
}

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

  /**
   * @see https://www.w3.org/TR/html/syntax.html#return-state
   */
  returnState: Pattern | null;

  /**
   * @see https://www.w3.org/TR/html/syntax.html#temporary-buffer
   */
  temporaryBuffer: string;

  /**
   * @see https://www.w3.org/TR/html/syntax.html#character-reference-code
   */
  characterReferenceCode: number;
};

export type Pattern = Lang.Pattern<Token, State>;

/**
 * @see https://www.w3.org/TR/html/syntax.html#data-state
 */
const data: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.Ampersand:
      state.returnState = data;
      return characterReference;

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
      emit(state.tag!);
      return data;

    case Char.Null:
      state.tag!.value += "\ufffd";
      break;

    case null:
      return Command.End;
  }

  if (isAlpha(char)) {
    state.tag!.value += fromCharCode(char).toLowerCase();
  } else {
    state.tag!.value += fromCharCode(char);
  }

  return tagName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#before-attribute-name-state
 */
const beforeAttributeName: Pattern = (stream, emit, state) => {
  const tag = state.tag!;
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

      if (tag.type === TokenType.StartTag) {
        tag.attributes.push(state.attribute);
      }

      return attributeName;
  }

  state.attribute = { name: "", value: "" };

  if (tag.type === TokenType.StartTag) {
    tag.attributes.push(state.attribute);
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
      state.attribute!.name += "\ufffd";
      return attributeName;
  }

  stream.advance(1);
  state.attribute!.name += fromCharCode(char);

  return attributeName;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#after-attribute-name-state
 */
const afterAttributeName: Pattern = (stream, emit, state) => {
  const tag = state.tag!;
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
      emit(tag);
      return data;

    case null:
      return Command.End;
  }

  state.attribute = { name: "", value: "" };

  if (tag.type === TokenType.StartTag) {
    tag.attributes.push(state.attribute);
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

    case Char.Ampersand:
      state.returnState = attributeValueDoubleQuoted;
      return characterReference;

    case Char.Null:
      state.attribute!.value += "\ufffd";
      return;

    case null:
      return Command.End;
  }

  state.attribute!.value += fromCharCode(char);
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#attribute-value-single-quoted-state
 */
const attributeValueSingleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.Apostrophe:
      return afterAttributeValueQuoted;

    case Char.Ampersand:
      state.returnState = attributeValueSingleQuoted;
      return characterReference;

    case Char.Null:
      state.attribute!.value += "\ufffd";
      return;

    case null:
      return Command.End;
  }

  state.attribute!.value += fromCharCode(char);
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

    case Char.Ampersand:
      state.returnState = attributeValueUnquoted;
      return characterReference;

    case Char.GreaterThanSign:
      emit(state.tag!);
      return data;

    case Char.Null:
      state.attribute!.value += "\ufffd";
      return;

    case null:
      return Command.End;
  }

  state.attribute!.value += fromCharCode(char);
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
      emit(state.tag!);
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
  const tag = state.tag!;
  const char = stream.peek(0);

  switch (char) {
    case Char.GreaterThanSign:
      stream.advance(1);

      if (tag.type === TokenType.StartTag) {
        tag.closed = true;
      }

      emit(tag);

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
      emit(state.comment!);
      return data;

    case null:
      emit(state.comment!);
      return Command.End;

    case Char.Null:
      state.comment!.value += "\ufffd";
      break;

    default:
      state.comment!.value += fromCharCode(char);
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
      emit(state.comment!);
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
      emit(state.comment!);
      return data;

    case null:
      stream.advance(1);

      if (state.comment !== null) {
        emit(state.comment);
      }

      return Command.End;
  }

  state.comment!.value += "-";

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#comment-state
 */
const comment: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.LessThanSign:
      state.comment!.value += fromCharCode(char);
      return commentLessThanSign;

    case Char.HyphenMinus:
      return commentEndDash;

    case Char.Null:
      state.comment!.value += "\ufffd";
      break;

    case null:
      emit(state.comment!);
      return Command.End;

    default:
      state.comment!.value += fromCharCode(char);
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
      state.comment!.value += fromCharCode(char);
      return commentLessThanSignBang;

    case Char.LessThanSign:
      stream.advance(1);
      state.comment!.value += fromCharCode(char);
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
      emit(state.comment!);
      return Command.End;
  }

  state.comment!.value += "-";

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
      emit(state.comment!);
      return data;

    case Char.ExclamationMark:
      stream.advance(1);
      return commentEndBang;

    case Char.HyphenMinus:
      stream.advance(1);
      state.comment!.value += "-";
      return commentEnd;

    case null:
      emit(state.comment!);
      return Command.End;
  }

  state.comment!.value += "--";

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
      state.comment!.value += "-!";
      return commentEndDash;

    case Char.GreaterThanSign:
      stream.advance(1);
      emit(state.comment!);
      return data;

    case null:
      emit(state.comment!);
      return Command.End;
  }

  state.comment!.value += "-!";

  return comment;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#character-reference-state
 */
const characterReference: Pattern = (stream, emit, state) => {
  state.temporaryBuffer = "&";

  let char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
    case Char.LessThanSign:
    case Char.Ampersand:
    case null:
      return characterReferenceEnd;

    case Char.NumberSign:
      stream.advance(1);
      state.temporaryBuffer += fromCharCode(char);
      return numericCharacterReference;
  }

  while (char !== null) {
    const reference = state.temporaryBuffer + fromCharCode(char);

    if (!entities.has(reference, true)) {
      break;
    }

    state.temporaryBuffer = reference;
    stream.advance(1);
    char = stream.peek(0);
  }

  const entity = entities.get(state.temporaryBuffer);

  if (entity === null) {
    return characterReferenceEnd;
  }

  switch (state.returnState) {
    case attributeValueDoubleQuoted:
    case attributeValueSingleQuoted:
    case attributeValueUnquoted:
      if (state.temporaryBuffer[state.temporaryBuffer.length - 1] !== ";") {
        if (char === null) {
          break;
        }

        if (char === Char.EqualSign || isAlphanumeric(char)) {
          return characterReferenceEnd;
        }
      }
  }

  state.temporaryBuffer = entity.characters;

  return characterReferenceEnd;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#numeric-character-reference-state
 */
const numericCharacterReference: Pattern = (stream, emit, state) => {
  state.characterReferenceCode = 0;

  const char = stream.peek(0);

  switch (char) {
    case Char.SmallLetterX:
    case Char.CapitalLetterX:
      stream.advance(1);
      state.temporaryBuffer += fromCharCode(char);
      return hexadecimalCharacterReferenceStart;
  }

  return decimalCharacterReferenceStart;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#hexadecimal-character-reference-start-state
 */
const hexadecimalCharacterReferenceStart: Pattern = stream => {
  const char = stream.peek(0);

  if (char !== null && isHex(char)) {
    return hexadecimalCharacterReference;
  }

  return characterReferenceEnd;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#decimal-character-reference-start-state
 */
const decimalCharacterReferenceStart: Pattern = stream => {
  const char = stream.peek(0);

  if (char !== null && isNumeric(char)) {
    return decimalCharacterReference;
  }

  return characterReferenceEnd;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#hexadecimal-character-reference-state
 */
const hexadecimalCharacterReference: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char !== null) {
    if (isNumeric(char)) {
      state.characterReferenceCode =
        state.characterReferenceCode * 0x10 + char - 0x30;
    } else if (isBetween(char, Char.CapitalLetterA, Char.CapitalLetterF)) {
      state.characterReferenceCode =
        state.characterReferenceCode * 0x10 + char - 0x37;
    } else if (isBetween(char, Char.SmallLetterA, Char.SmallLetterF)) {
      state.characterReferenceCode =
        state.characterReferenceCode * 0x10 + char - 0x57;
    }
  }

  return numericCharacterReferenceEnd;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#decimal-character-reference-state
 */
const decimalCharacterReference: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char !== null && isNumeric(char)) {
    state.characterReferenceCode * 0x10 + char - 0x30;
  }

  return numericCharacterReferenceEnd;
};

const replacementCodes: { [code: number]: number } = {
  [0x30]: 0xfffd,
  [0x80]: 0x20ac,
  [0x82]: 0x201a,
  [0x83]: 0x0192,
  [0x84]: 0x201e,
  [0x85]: 0x2026,
  [0x86]: 0x2020,
  [0x87]: 0x2021,
  [0x88]: 0x02c6,
  [0x89]: 0x2030,
  [0x8a]: 0x0160,
  [0x8b]: 0x2039,
  [0x8c]: 0x0152,
  [0x8e]: 0x017d,
  [0x91]: 0x2018,
  [0x92]: 0x2019,
  [0x93]: 0x201c,
  [0x94]: 0x201d,
  [0x95]: 0x2022,
  [0x96]: 0x2013,
  [0x97]: 0x2014,
  [0x98]: 0x02dc,
  [0x99]: 0x2122,
  [0x9a]: 0x0161,
  [0x9b]: 0x203a,
  [0x9c]: 0x0153,
  [0x9e]: 0x017e,
  [0x9f]: 0x0178
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#numeric-character-reference-end-state
 */
const numericCharacterReferenceEnd: Pattern = (stream, emit, state) => {
  let code = state.characterReferenceCode;

  if (code in replacementCodes) {
    code = replacementCodes[code];
  } else if (isBetween(code, 0xd800, 0xdfff) || code > 0x10ffff) {
    code = 0xfffd;
  }

  state.temporaryBuffer = fromCharCode(code);

  return characterReferenceEnd;
};

/**
 * @see https://www.w3.org/TR/html/syntax.html#character-reference-end-state
 */
const characterReferenceEnd: Pattern = (stream, emit, state) => {
  switch (state.returnState) {
    case attributeValueDoubleQuoted:
    case attributeValueSingleQuoted:
    case attributeValueUnquoted:
      state.attribute!.value += state.temporaryBuffer;
      break;
    default:
      for (let i = 0, n = state.temporaryBuffer.length; i < n; i++) {
        emit({ type: TokenType.Character, value: state.temporaryBuffer[i] });
      }
  }

  return state.returnState!;
};

export const Alphabet: Lang.Alphabet<Token, State> = new Lang.Alphabet(
  data,
  () => ({
    tag: null,
    attribute: null,
    comment: null,
    returnState: null,
    temporaryBuffer: "",
    characterReferenceCode: 0
  })
);
