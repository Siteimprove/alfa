import * as Lang from "@siteimprove/alfa-lang";
import {
  Char,
  Command,
  isAlpha,
  isAlphanumeric,
  isBetween,
  isHex,
  isNumeric,
  Stream
} from "@siteimprove/alfa-lang";
import { keys, Mutable } from "@siteimprove/alfa-util";
import { Entities, Entity } from "./entities";
import { PrefixTree } from "./prefix-tree";

const entities: PrefixTree<Entity> = new PrefixTree();

for (const key of keys(Entities)) {
  const entity = Entities[key];

  entities.set(key as string, entity);
}

const { fromCharCode } = String;

export const enum TokenType {
  Doctype,
  StartTag,
  EndTag,
  Comment,
  Character
}

export interface Doctype {
  readonly type: TokenType.Doctype;
  readonly name: string | null;
  readonly publicId: string | null;
  readonly systemId: string | null;
  readonly forceQuirks: boolean;
}

export interface Attribute {
  readonly name: string;
  readonly value: string;
}

export interface StartTag {
  readonly type: TokenType.StartTag;
  readonly name: string;
  readonly selfClosing: boolean;
  readonly attributes: Array<Attribute>;
}

export interface EndTag {
  readonly type: TokenType.EndTag;
  readonly name: string;
}

export interface Comment {
  readonly type: TokenType.Comment;
  readonly data: string;
}

export interface Character {
  readonly type: TokenType.Character;
  readonly data: number;
}

/**
 * @see https://www.w3.org/TR/html/syntax.html#appropriate-end-tag-token
 */
function isAppropriateEndTagToken(
  tag: StartTag | EndTag,
  name: string
): boolean {
  return tag.type === TokenType.StartTag && tag.name === name;
}

/**
 * 8.2.4
 * @see https://www.w3.org/TR/html/syntax.html#tokenization
 */
export type Token =
  | Doctype

  // Tag tokens
  | StartTag
  | EndTag

  // Data tokens
  | Character
  | Comment;

interface State {
  doctype: Mutable<Doctype> | null;
  tag: Mutable<StartTag | EndTag> | null;
  startTag: Mutable<StartTag | EndTag> | null;
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
}

type Pattern = Lang.Pattern<Token, State>;

/**
 * 8.2.4.1
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

  emit({ type: TokenType.Character, data: char });
};

/**
 * 8.2.4.2
 * @see https://www.w3.org/TR/html/syntax.html#RCDATA-state
 */

const RCData: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.Ampersand:
      state.returnState = RCData;
      return characterReference;

    case Char.LessThanSign:
      return RCDataLessThanSign;

    case Char.Null:
      emit({ type: TokenType.Character, data: 0xfffd });
      break;

    case null:
      return Command.End;

    default:
      emit({ type: TokenType.Character, data: char });
  }
};

/**
 * 8.2.4.3
 * @see https://www.w3.org/TR/html/syntax.html#rawtext-state
 */
const RawText: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.LessThanSign:
      return RawTextLessThanSign;

    case Char.Null:
      emit({ type: TokenType.Character, data: 0xfffd });
      break;

    case null:
      return Command.End;

    default:
      emit({ type: TokenType.Character, data: char });
  }
};

/**
 * 8.2.4.4
 * @see https://www.w3.org/TR/html/syntax.html#script-data-state
 */
const scriptData: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.LessThanSign:
      return scriptDataLessThanSign;

    case Char.Null:
      emit({ type: TokenType.Character, data: 0xfffd });
      break;

    case null:
      return Command.End;

    default:
      emit({ type: TokenType.Character, data: char });
  }
};

/**
 * 8.2.4.6
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
        data: ""
      };

      return bogusComment;
  }

  if (char !== null && isAlpha(char)) {
    state.tag = {
      type: TokenType.StartTag,
      name: "",
      selfClosing: false,
      attributes: []
    };

    return tagName;
  }

  emit({ type: TokenType.Character, data: 0x003c });

  return data;
};

/**
 * 8.2.4.7
 * @see https://www.w3.org/TR/html/syntax.html#end-tag-open-state
 */
const endTagOpen: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === null) {
    emit({ type: TokenType.Character, data: 0x003c });
    emit({ type: TokenType.Character, data: 0x002f });
    return Command.End;
  }

  if (isAlpha(char)) {
    state.tag = {
      type: TokenType.EndTag,
      name: ""
    };

    return tagName;
  }

  if (char === Char.GreaterThanSign) {
    stream.advance(1);
    return data;
  }

  state.comment = {
    type: TokenType.Comment,
    data: ""
  };

  return bogusComment;
};

/**
 * 8.2.4.8
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
      state.startTag = state.tag;
      return findAppropriateState(state.tag!);

    case Char.Null:
      state.tag!.name += "\ufffd";
      break;

    case null:
      return Command.End;
  }

  if (isAlpha(char)) {
    state.tag!.name += fromCharCode(char).toLowerCase();
  } else {
    state.tag!.name += fromCharCode(char);
  }

  return tagName;
};

/**
 * 8.2.4.9
 * @see https://www.w3.org/TR/html/syntax.html#RCDATA-less-than-sign-state
 */
const RCDataLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.Solidus) {
    stream.advance(1);
    state.temporaryBuffer = "";
    return RCDataEndTagOpenState;
  }

  emit({ type: TokenType.Character, data: 0x003c });
  return RCData;
};

/**
 * 8.2.4.10
 * @see https://www.w3.org/TR/html/syntax.html#RCDATA-end-tag-open-state
 */
const RCDataEndTagOpenState: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === null || !isAlpha(char)) {
    emit({ type: TokenType.Character, data: 0x003c });
    emit({ type: TokenType.Character, data: 0x002f });
    return RCData;
  }

  state.tag = {
    name: "",
    type: TokenType.EndTag
  };

  return RCDataEndTagName;
};

/**
 * 8.2.4.11
 * @see https://www.w3.org/TR/html/syntax.html#RCDATA-end-tag-name-state
 */
const RCDataEndTagName: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      stream.advance(1);
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        return beforeAttributeName;
      }
      break;

    case Char.Solidus:
      stream.advance(1);
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        return selfClosingStartTag;
      }
      break;

    case Char.GreaterThanSign:
      stream.advance(1);
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        emit(state.tag!);

        return data;
      }
      break;

    default:
      if (char !== null && isAlpha(char)) {
        stream.advance(1);

        const str = fromCharCode(char);

        state.tag!.name += str.toLowerCase();
        state.temporaryBuffer += str;
        return;
      }
  }

  emit({ type: TokenType.Character, data: 0x003c });
  emit({ type: TokenType.Character, data: 0x002f });

  for (let i = 0, n = state.temporaryBuffer.length; i < n; i++) {
    emit({
      type: TokenType.Character,
      data: state.temporaryBuffer.charCodeAt(i)
    });
  }

  return RCData;
};

/**
 * 8.2.4.12
 * @see https://www.w3.org/TR/html/syntax.html#rawtext-less-than-sign-state
 */
const RawTextLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.Solidus) {
    stream.advance(1);
    state.temporaryBuffer = "";
    return RawTextEndTagOpen;
  }

  emit({ type: TokenType.Character, data: 0x003c });
  return RawText;
};

/**
 * 8.2.4.13
 * @see https://www.w3.org/TR/html/syntax.html#rawtext-end-tag-open-state
 */
const RawTextEndTagOpen: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === null || !isAlpha(char)) {
    emit({ type: TokenType.Character, data: 0x003c });
    emit({ type: TokenType.Character, data: 0x002f });
    return RawText;
  }

  state.tag = {
    name: "",
    type: TokenType.EndTag
  };

  return RawTextEndTagName;
};

/**
 * 8.2.4.14
 * @see https://www.w3.org/TR/html/syntax.html#rawtext-end-tag-name-state
 */
const RawTextEndTagName: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      stream.advance(1);
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        return beforeAttributeName;
      }
      break;

    case Char.Solidus:
      stream.advance(1);
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        return selfClosingStartTag;
      }
      break;

    case Char.GreaterThanSign:
      stream.advance(1);
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        emit(state.tag!);

        return data;
      }
      break;

    default:
      if (char !== null && isAlpha(char)) {
        stream.advance(1);

        const str = fromCharCode(char);

        state.tag!.name += str.toLowerCase();
        state.temporaryBuffer += str;
        return;
      }
  }

  emit({ type: TokenType.Character, data: 0x003c });
  emit({ type: TokenType.Character, data: 0x002f });

  for (let i = 0, n = state.temporaryBuffer.length; i < n; i++) {
    emit({
      type: TokenType.Character,
      data: state.temporaryBuffer.charCodeAt(i)
    });
  }

  return RawText;
};

/**
 * 8.2.4.15
 * @see https://www.w3.org/TR/html/syntax.html#script-data-less-than-sign-state
 */
const scriptDataLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.Solidus:
      stream.advance(1);
      state.temporaryBuffer = "";
      return scriptDataEndTagOpen;

    case Char.ExclamationMark:
      stream.advance(1);
      emit({ type: TokenType.Character, data: 0x003c });
      emit({ type: TokenType.Character, data: 0x0021 });
      return scriptDataEscapeStart;

    default:
      emit({ type: TokenType.Character, data: 0x003c });
      return scriptData;
  }
};

/**
 * 8.2.4.16
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-end-tag-open-state
 */
const scriptDataEndTagOpen: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === null || !isAlpha(char)) {
    emit({ type: TokenType.Character, data: 0x003c });
    emit({ type: TokenType.Character, data: 0x002f });
    return scriptData;
  }

  state.tag = {
    type: TokenType.EndTag,
    name: ""
  };
  return scriptDataEndTagName;
};

/**
 * 8.2.4.17
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-end-tag-name-state
 */
const scriptDataEndTagName: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      stream.advance(1);
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        return beforeAttributeName;
      }
      break;

    case Char.Solidus:
      stream.advance(1);
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        return selfClosingStartTag;
      }
      break;

    case Char.GreaterThanSign:
      stream.advance(1);
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        emit(state.tag!);
        return data;
      }
      break;

    default:
      if (char !== null && isAlpha(char)) {
        stream.advance(1);

        const str = fromCharCode(char);

        state.tag!.name += str.toLowerCase();
        state.temporaryBuffer += str;
        return;
      }
  }

  emit({ type: TokenType.Character, data: 0x003c });
  emit({ type: TokenType.Character, data: 0x002f });

  for (let i = 0, n = state.temporaryBuffer.length; i < n; i++) {
    emit({
      type: TokenType.Character,
      data: state.temporaryBuffer.charCodeAt(i)
    });
  }

  return scriptData;
};

/**
 * 8.2.4.18
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-escape-start-state
 */
const scriptDataEscapeStart: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.HyphenMinus:
      stream.advance(1);
      emit({ type: TokenType.Character, data: 0x002d });
      return scriptDataEscapeStartDash;

    default:
      return scriptData;
  }
};

/**
 * 8.2.4.19
 * @see https://www.w3.org/TR/html/syntax.html#ref-for-tokenizer-script-data-escapse-start-dash-state
 */
const scriptDataEscapeStartDash: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.HyphenMinus:
      stream.advance(1);
      emit({ type: TokenType.Character, data: 0x002d });
      return scriptDataEscapedDashDash;

    default:
      return scriptData;
  }
};

/**
 * 8.2.4.20
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-escaped-state
 */
const scriptDataEscaped: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.HyphenMinus:
      emit({ type: TokenType.Character, data: 0x002d });
      return scriptDataEscapedDash;

    case Char.LessThanSign:
      return scriptDataEscapedLessThanSign;

    case Char.Null:
      emit({ type: TokenType.Character, data: 0xfffd });
      break;

    case null:
      return Command.End;

    default:
      emit({ type: TokenType.Character, data: char });
  }
};

/**
 * 8.2.4.21
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-escaped-dash-state
 */
const scriptDataEscapedDash: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.HyphenMinus:
      emit({ type: TokenType.Character, data: 0x002d });
      return scriptDataEscapedDashDash;

    case Char.LessThanSign:
      return scriptDataEscapedLessThanSign;

    case Char.Null:
      emit({ type: TokenType.Character, data: 0xfffd });
      return scriptDataEscaped;

    case null:
      return Command.End;

    default:
      emit({ type: TokenType.Character, data: char });
      return scriptDataEscaped;
  }
};

/**
 * 8.2.4.22
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-escaped-dash-dash-state
 */
const scriptDataEscapedDashDash: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.HyphenMinus:
      emit({ type: TokenType.Character, data: 0x002d });
      break;

    case Char.LessThanSign:
      return scriptDataEscapedLessThanSign;

    case Char.GreaterThanSign:
      emit({ type: TokenType.Character, data: 0x003e });
      return scriptData;

    case Char.Null:
      emit({ type: TokenType.Character, data: 0xfffd });
      return scriptDataEscaped;

    case null:
      return Command.End;

    default:
      emit({ type: TokenType.Character, data: char });
      return scriptDataEscaped;
  }
};

/**
 * 8.2.4.23
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-escaped-less-than-sign-state
 */
const scriptDataEscapedLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.Solidus) {
    stream.advance(1);
    state.temporaryBuffer = "";
    return scriptDataEscapedEndTagOpen;
  }

  if (char !== null && isAlpha(char)) {
    state.temporaryBuffer = "";
    emit({ type: TokenType.Character, data: 0x003c });
    return scriptDataDoubleEscapeStart;
  }

  emit({ type: TokenType.Character, data: 0x003c });
  return scriptDataEscaped;
};

/**
 * 8.2.4.24
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-escaped-end-tag-open-state
 */
const scriptDataEscapedEndTagOpen: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === null || !isAlpha(char)) {
    emit({ type: TokenType.Character, data: 0x003c });
    emit({ type: TokenType.Character, data: 0x002f });
    return scriptDataEscaped;
  }

  state.tag = {
    type: TokenType.EndTag,
    name: ""
  };
  return scriptDataEscapedEndTagName;
};

/**
 * 8.2.4.25
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-escaped-end-tag-name-state
 */
const scriptDataEscapedEndTagName: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        stream.advance(1);
        return beforeAttributeName;
      }
      break;

    case Char.Solidus:
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        stream.advance(1);
        return selfClosingStartTag;
      }
      break;

    case Char.GreaterThanSign:
      if (isAppropriateEndTagToken(state.startTag!, state.tag!.name)) {
        stream.advance(1);
        emit(state.tag!);
        return data;
      }
      break;

    default:
      if (char !== null && isAlpha(char)) {
        stream.advance(1);

        const str = fromCharCode(char);

        state.tag!.name += str.toLowerCase();
        state.temporaryBuffer += str;
        return;
      }
  }

  emit({ type: TokenType.Character, data: 0x003c });
  emit({ type: TokenType.Character, data: 0x002f });

  for (let i = 0, n = state.temporaryBuffer.length; i < n; i++) {
    emit({
      type: TokenType.Character,
      data: state.temporaryBuffer.charCodeAt(i)
    });
  }

  return scriptDataEscaped;
};

/**
 * 8.2.4.26
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-double-escape-start-state
 */
const scriptDataDoubleEscapeStart: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
    case Char.Solidus:
    case Char.GreaterThanSign:
      stream.advance(1);
      emit({ type: TokenType.Character, data: char });
      if (state.temporaryBuffer === "script") {
        return scriptDataDoubleEscaped;
      }
      return scriptDataEscaped;

    default:
      if (char !== null && isAlpha(char)) {
        stream.advance(1);
        state.temporaryBuffer += fromCharCode(char).toLowerCase();
        emit({ type: TokenType.Character, data: char });
        break;
      }

      return scriptDataEscaped;
  }
};

/**
 * 8.2.4.27
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-double-escaped-state
 */
const scriptDataDoubleEscaped: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.HyphenMinus:
      emit({ type: TokenType.Character, data: 0x002d });
      return scriptDataDoubleEscapedDash;

    case Char.LessThanSign:
      emit({ type: TokenType.Character, data: 0x003c });
      return scriptDataDoubleEscapedLessThanSign;

    case Char.Null:
      emit({ type: TokenType.Character, data: 0xfffd });
      break;

    case null:
      return Command.End;

    default:
      emit({ type: TokenType.Character, data: char });
  }
};

/**
 * 8.2.4.28
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-double-escaped-dash-state
 */
const scriptDataDoubleEscapedDash: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.HyphenMinus:
      emit({ type: TokenType.Character, data: 0x002d });
      return scriptDataDoubleEscapedDashDash;

    case Char.LessThanSign:
      emit({ type: TokenType.Character, data: 0x003c });
      return scriptDataDoubleEscapedLessThanSign;

    case Char.Null:
      emit({ type: TokenType.Character, data: 0xfffd });
      return scriptDataDoubleEscaped;

    case null:
      return Command.End;

    default:
      emit({ type: TokenType.Character, data: char });
      return scriptDataDoubleEscaped;
  }
};

/**
 * 8.2.4.29
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-double-escaped-dash-dash-state
 */
const scriptDataDoubleEscapedDashDash: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.HyphenMinus:
      emit({ type: TokenType.Character, data: 0x002d });
      break;

    case Char.LessThanSign:
      emit({ type: TokenType.Character, data: 0x003c });
      return scriptDataDoubleEscapedLessThanSign;

    case Char.GreaterThanSign:
      emit({ type: TokenType.Character, data: 0x003e });
      return scriptData;

    case Char.Null:
      emit({ type: TokenType.Character, data: 0xfffd });
      return scriptDataDoubleEscaped;

    case null:
      return Command.End;

    default:
      emit({ type: TokenType.Character, data: char });
      return scriptDataDoubleEscaped;
  }
};

/**
 * 8.2.4.30
 * @see https://www.w3.org/TR/html/syntax.html#tokenizer-script-data-double-escaped-less-than-sign-state
 */
const scriptDataDoubleEscapedLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char === Char.Solidus) {
    stream.advance(1);
    state.temporaryBuffer = "";
    emit({ type: TokenType.Character, data: 0x002f });
    return scriptDataDoubleEscapeEnd;
  }

  return scriptDataDoubleEscaped;
};

/**
 * 8.2.4.31
 * @see https://www.w3.org/TR/html/syntax.html#script-data-double-escape-end-state
 */
const scriptDataDoubleEscapeEnd: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
    case Char.Solidus:
    case Char.GreaterThanSign:
      stream.advance(1);
      emit({ type: TokenType.Character, data: char });

      if (state.temporaryBuffer === "script") {
        return scriptDataEscaped;
      }

      return scriptDataDoubleEscaped;

    default:
      if (char !== null && isAlpha(char)) {
        stream.advance(1);
        state.temporaryBuffer += fromCharCode(char).toLowerCase();
        emit({ type: TokenType.Character, data: char });
        break;
      }

      return scriptDataDoubleEscaped;
  }
};

/**
 * 8.2.4.32
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
 * 8.2.4.33
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
    case null: {
      const tag = state.tag!;

      if (tag.type === TokenType.StartTag) {
        removeAttributeIfDuplicate(tag.attributes, state.attribute!);
      }

      return afterAttributeName;
    }

    case Char.EqualSign: {
      stream.advance(1);

      const tag = state.tag!;

      if (tag.type === TokenType.StartTag) {
        removeAttributeIfDuplicate(tag.attributes, state.attribute!);
      }

      return beforeAttributeValue;
    }

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
 * 8.2.4.34
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
 * 8.2.4.35
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
 * 8.2.4.36
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
 * 8.2.4.37
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
 * 8.2.4.38
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
      state.startTag = state.tag;
      return findAppropriateState(state.tag!);

    case Char.Null:
      state.attribute!.value += "\ufffd";
      return;

    case null:
      return Command.End;
  }

  state.attribute!.value += fromCharCode(char);
};

/**
 * 8.2.4.39
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
      state.startTag = state.tag;
      return findAppropriateState(state.tag!);

    case null:
      return Command.End;
  }

  return beforeAttributeName;
};

/**
 * 8.2.4.40
 * @see https://www.w3.org/TR/html/syntax.html#self-closing-start-tag-state
 */
const selfClosingStartTag: Pattern = (stream, emit, state) => {
  const tag = state.tag!;
  const char = stream.peek(0);

  switch (char) {
    case Char.GreaterThanSign:
      stream.advance(1);

      if (tag.type === TokenType.StartTag) {
        tag.selfClosing = true;
      }

      emit(tag);

      return data;

    case null:
      return Command.End;
  }

  return beforeAttributeName;
};

/**
 * 8.2.4.41
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
      state.comment!.data += "\ufffd";
      break;

    default:
      state.comment!.data += fromCharCode(char);
  }
};

/**
 * 8.2.4.42
 * @see https://www.w3.org/TR/html/syntax.html#markup-declaration-open-state
 */
const markupDeclarationOpen: Pattern = (stream, emit, state) => {
  if (startsWith(stream, "doctype", { lowerCase: true })) {
    stream.advance(7);
    return doctype;
  }

  if (
    stream.peek(0) === Char.HyphenMinus &&
    stream.peek(1) === Char.HyphenMinus
  ) {
    stream.advance(2);
    state.comment = {
      type: TokenType.Comment,
      data: ""
    };
    return commentStart;
  }

  state.comment = {
    type: TokenType.Comment,
    data: ""
  };

  return bogusComment;
};

/**
 * 8.2.4.43
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
 * 8.2.4.44
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

  state.comment!.data += "-";

  return comment;
};

/**
 * 8.2.4.45
 * @see https://www.w3.org/TR/html/syntax.html#comment-state
 */
const comment: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.LessThanSign:
      state.comment!.data += fromCharCode(char);
      return commentLessThanSign;

    case Char.HyphenMinus:
      return commentEndDash;

    case Char.Null:
      state.comment!.data += "\ufffd";
      break;

    case null:
      emit(state.comment!);
      return Command.End;

    default:
      state.comment!.data += fromCharCode(char);
  }

  return comment;
};

/**
 * 8.2.4.46
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-state
 */
const commentLessThanSign: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.ExclamationMark:
      stream.advance(1);
      state.comment!.data += fromCharCode(char);
      return commentLessThanSignBang;

    case Char.LessThanSign:
      stream.advance(1);
      state.comment!.data += fromCharCode(char);
      return commentLessThanSign;
  }

  return comment;
};

/**
 * 8.2.4.47
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
 * 8.2.4.48
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
 * 8.2.4.49
 * @see https://www.w3.org/TR/html/syntax.html#comment-less-than-sign-bang-dash-dash-state
 */
const commentLessThanSignBangDashDash: Pattern = stream => {
  return commentEnd;
};

/**
 * 8.2.4.50
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

  state.comment!.data += "-";

  return comment;
};

/**
 * 8.2.4.51
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
      state.comment!.data += "-";
      return commentEnd;

    case null:
      emit(state.comment!);
      return Command.End;
  }

  state.comment!.data += "--";

  return comment;
};

/**
 * 8.2.4.52
 * @see https://www.w3.org/TR/html/syntax.html#comment-end-bang-state
 */
const commentEndBang: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.HyphenMinus:
      stream.advance(1);
      state.comment!.data += "-!";
      return commentEndDash;

    case Char.GreaterThanSign:
      stream.advance(1);
      emit(state.comment!);
      return data;

    case null:
      emit(state.comment!);
      return Command.End;
  }

  state.comment!.data += "-!";

  return comment;
};

/**
 * 8.2.4.53
 * @see https://www.w3.org/TR/html/syntax.html#doctype-state
 */
const doctype: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      stream.advance(1);
      return beforeDoctypeName;

    case null:
      state.doctype = {
        type: TokenType.Doctype,
        name: null,
        publicId: null,
        systemId: null,
        forceQuirks: true
      };

      emit(state.doctype);

      return Command.End;
  }

  return beforeDoctypeName;
};

/**
 * 8.2.4.54
 * @see https://www.w3.org/TR/html/syntax.html#before-doctype-name-state
 */
const beforeDoctypeName: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return;

    case Char.Null:
      state.doctype = {
        type: TokenType.Doctype,
        name: "\ufffd",
        publicId: null,
        systemId: null,
        forceQuirks: false
      };

      return doctypeName;

    case Char.GreaterThanSign:
      state.doctype = {
        type: TokenType.Doctype,
        name: null,
        publicId: null,
        systemId: null,
        forceQuirks: true
      };

      return data;

    case null:
      state.doctype = {
        type: TokenType.Doctype,
        name: null,
        publicId: null,
        systemId: null,
        forceQuirks: true
      };

      emit(state.doctype);

      return Command.End;
  }

  let name = fromCharCode(char);

  if (isAlpha(char)) {
    name = name.toLowerCase();
  }

  state.doctype = {
    type: TokenType.Doctype,
    name,
    publicId: null,
    systemId: null,
    forceQuirks: false
  };

  return doctypeName;
};

/**
 * 8.2.4.55
 * @see https://www.w3.org/TR/html/syntax.html#doctype-name-state
 */
const doctypeName: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return afterDoctypeName;

    case Char.GreaterThanSign:
      emit(state.doctype!);
      return data;

    case Char.Null:
      state.doctype!.name += "\ufffd";
      break;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  if (isAlpha(char)) {
    state.doctype!.name += fromCharCode(char).toLowerCase();
  } else {
    state.doctype!.name += fromCharCode(char);
  }
};

/**
 * 8.2.4.56
 * @see https://www.w3.org/TR/html/syntax.html#after-doctype-name-state
 */
const afterDoctypeName: Pattern = (stream, emit, state) => {
  if (startsWith(stream, "public", { lowerCase: true })) {
    stream.advance(6);
    return afterDoctypePublicKeyword;
  }

  if (startsWith(stream, "system", { lowerCase: true })) {
    stream.advance(6);
    return afterDoctypeSystemKeyword;
  }

  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return;

    case Char.GreaterThanSign:
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.forceQuirks = true;

  return bogusDoctype;
};

/**
 * 8.2.4.57
 * @see https://www.w3.org/TR/html/syntax.html#after-doctype-public-keyword-state
 */
const afterDoctypePublicKeyword: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return beforeDoctypePublicIdentifier;

    case Char.QuotationMark:
      state.doctype!.publicId = "";
      return doctypePublicIdentifierDoubleQuoted;

    case Char.Apostrophe:
      state.doctype!.publicId = "";
      return doctypePublicIdentifierSingleQuoted;

    case Char.GreaterThanSign:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.forceQuirks = true;

  return bogusDoctype;
};

/**
 * 8.2.4.58
 * @see https://www.w3.org/TR/html/syntax.html#before-doctype-public-identifier-state
 */
const beforeDoctypePublicIdentifier: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return;

    case Char.QuotationMark:
      state.doctype!.publicId = "";
      return doctypePublicIdentifierDoubleQuoted;

    case Char.Apostrophe:
      state.doctype!.publicId = "";
      return doctypePublicIdentifierSingleQuoted;

    case Char.GreaterThanSign:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.forceQuirks = true;

  return bogusDoctype;
};

/**
 * 8.2.4.59
 * @see https://www.w3.org/TR/html/syntax.html#doctype-public-identifier-double-quoted-state
 */
const doctypePublicIdentifierDoubleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.QuotationMark:
      return afterDoctypePublicIdentifier;

    case Char.Null:
      state.doctype!.publicId += "\ufffd";
      return;

    case Char.GreaterThanSign:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.publicId += fromCharCode(char);
};

/**
 * 8.2.4.60
 * @see https://www.w3.org/TR/html/syntax.html#doctype-public-identifier-single-quoted-state
 */
const doctypePublicIdentifierSingleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.Apostrophe:
      return afterDoctypePublicIdentifier;

    case Char.Null:
      state.doctype!.publicId += "\ufffd";
      return;

    case Char.GreaterThanSign:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.publicId += fromCharCode(char);
};

/**
 * 8.2.4.61
 * @see https://www.w3.org/TR/html/syntax.html#after-doctype-public-identifier-state
 */
const afterDoctypePublicIdentifier: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return betweenDoctypePublicAndSystemIdentifiers;

    case Char.GreaterThanSign:
      emit(state.doctype!);
      return data;

    case Char.QuotationMark:
      state.doctype!.systemId = "";
      return doctypeSystemIdentifierDoubleQuoted;

    case Char.Apostrophe:
      state.doctype!.systemId = "";
      return doctypeSystemIdentifierSingleQuoted;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.forceQuirks = true;

  return bogusDoctype;
};

/**
 * 8.2.4.62
 * @see https://www.w3.org/TR/html/syntax.html#between-doctype-public-and-system-identifiers-state
 */
const betweenDoctypePublicAndSystemIdentifiers: Pattern = (
  stream,
  emit,
  state
) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return;

    case Char.GreaterThanSign:
      emit(state.doctype!);
      return data;

    case Char.QuotationMark:
      state.doctype!.systemId = "";
      return doctypeSystemIdentifierDoubleQuoted;

    case Char.Apostrophe:
      state.doctype!.systemId = "";
      return doctypeSystemIdentifierSingleQuoted;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.forceQuirks = true;

  return bogusDoctype;
};

/**
 * 8.2.4.63
 * @see https://www.w3.org/TR/html/syntax.html#after-doctype-system-keyword-state
 */
const afterDoctypeSystemKeyword: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return beforeDoctypeSystemIdentifier;

    case Char.QuotationMark:
      state.doctype!.systemId = "";
      return doctypeSystemIdentifierDoubleQuoted;

    case Char.Apostrophe:
      state.doctype!.systemId = "";
      return doctypeSystemIdentifierSingleQuoted;

    case Char.GreaterThanSign:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.forceQuirks = true;

  return bogusDoctype;
};

/**
 * 8.2.4.64
 * @see https://www.w3.org/TR/html/syntax.html#before-doctype-system-identifier-state
 */
const beforeDoctypeSystemIdentifier: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return;

    case Char.QuotationMark:
      state.doctype!.systemId = "";
      return doctypeSystemIdentifierDoubleQuoted;

    case Char.Apostrophe:
      state.doctype!.systemId = "";
      return doctypeSystemIdentifierSingleQuoted;

    case Char.GreaterThanSign:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.forceQuirks = true;

  return bogusDoctype;
};

/**
 * 8.2.4.65
 * @see https://www.w3.org/TR/html/syntax.html#doctype-system-identifier-double-quoted-state
 */
const doctypeSystemIdentifierDoubleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.QuotationMark:
      return afterDoctypeSystemIdentifier;

    case Char.Null:
      state.doctype!.systemId += "\ufffd";
      return;

    case Char.GreaterThanSign:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.systemId += fromCharCode(char);
};

/**
 * 8.2.4.66
 * @see https://www.w3.org/TR/html/syntax.html#doctype-system-identifier-single-quoted-state
 */
const doctypeSystemIdentifierSingleQuoted: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.Apostrophe:
      return afterDoctypeSystemIdentifier;

    case Char.Null:
      state.doctype!.systemId += "\ufffd";
      return;

    case Char.GreaterThanSign:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  state.doctype!.systemId += fromCharCode(char);
};

/**
 * 8.2.4.67
 * @see https://www.w3.org/TR/html/syntax.html#after-doctype-system-identifier-state
 */
const afterDoctypeSystemIdentifier: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.CharacterTabulation:
    case Char.LineFeed:
    case Char.FormFeed:
    case Char.Space:
      return;

    case Char.GreaterThanSign:
      emit(state.doctype!);
      return data;

    case null:
      state.doctype!.forceQuirks = true;
      emit(state.doctype!);
      return Command.End;
  }

  return bogusDoctype;
};

/**
 * 8.2.4.68
 * @see https://www.w3.org/TR/html/syntax.html#bogus-doctype-state
 */
const bogusDoctype: Pattern = (stream, emit, state) => {
  const char = stream.next();

  switch (char) {
    case Char.GreaterThanSign:
      emit(state.doctype!);
      return data;

    case null:
      emit(state.doctype!);
      return Command.End;
  }
};

/**
 * 8.2.4.72
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
 * 8.2.4.73
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
 * 8.2.4.74
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
 * 8.2.4.75
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
 * 8.2.4.76
 * @see https://www.w3.org/TR/html/syntax.html#hexadecimal-character-reference-state
 */
const hexadecimalCharacterReference: Pattern = (stream, emit, state) => {
  const char = stream.peek(0);

  if (char !== null) {
    if (isNumeric(char)) {
      stream.advance(1);
      state.characterReferenceCode =
        state.characterReferenceCode * 0x10 + char - 0x30;
      return;
    } else if (isBetween(char, Char.CapitalLetterA, Char.CapitalLetterF)) {
      stream.advance(1);
      state.characterReferenceCode =
        state.characterReferenceCode * 0x10 + char - 0x37;
      return;
    } else if (isBetween(char, Char.SmallLetterA, Char.SmallLetterF)) {
      stream.advance(1);
      state.characterReferenceCode =
        state.characterReferenceCode * 0x10 + char - 0x57;
      return;
    } else if (char === Char.Semicolon) {
      stream.advance(1);
    }
  }

  return numericCharacterReferenceEnd;
};

/**
 * 8.2.4.77
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
 * 8.2.4.78
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
 * 8.2.4.79
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
        emit({
          type: TokenType.Character,
          data: state.temporaryBuffer.charCodeAt(i)
        });
      }
  }

  return state.returnState!;
};

export const Alphabet: Lang.Alphabet<Token, State> = new Lang.Alphabet(
  data,
  () => ({
    doctype: null,
    tag: null,
    startTag: null,
    attribute: null,
    comment: null,
    returnState: null,
    temporaryBuffer: "",
    characterReferenceCode: 0
  })
);

function startsWith(
  stream: Stream<number>,
  query: string,
  options: { lowerCase?: boolean } = {}
): boolean {
  for (let i = 0, n = query.length; i < n; i++) {
    const code = stream.peek(i);

    if (code === null) {
      return false;
    }

    let char = fromCharCode(code);

    if (options.lowerCase === true) {
      char = char.toLowerCase();
    }

    if (char !== query[i]) {
      return false;
    }
  }

  return true;
}

function findAppropriateState(tag: StartTag | EndTag) {
  switch (tag.name) {
    case "script":
      if (tag.type === TokenType.StartTag) {
        return scriptData;
      }
      break;

    case "textarea":
      if (tag.type === TokenType.StartTag) {
        return RCData;
      }
      break;

    case "noscript":
    case "noframes":
      if (tag.type === TokenType.StartTag) {
        return RawText;
      }
  }

  return data;
}

function removeAttributeIfDuplicate(
  attributes: Array<Attribute>,
  attribute: Attribute
) {
  const name = attribute.name.toLowerCase();

  const duplicate = attributes.find(
    found => found !== attribute && found.name.toLowerCase() === name
  );

  if (duplicate !== undefined) {
    attributes.splice(attributes.indexOf(attribute), 1);
  }
}
