import * as Lang from "@siteimprove/alfa-lang";
import { Char, Grammar, isNumeric, skip, Stream } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../alphabet";
import { ChildIndex } from "../types";

type Production<T extends Token> = Lang.Production<Token, ChildIndex, T>;

const number: Production<Tokens.Number> = {
  token: TokenType.Number,
  prefix(token, stream) {
    if (!token.integer) {
      return null;
    }

    return {
      step: 0,
      offset: token.value
    };
  }
};

const dimension: Production<Tokens.Dimension> = {
  token: TokenType.Dimension,
  prefix(token, stream) {
    if (!token.integer) {
      return null;
    }

    const unit = token.unit.toLowerCase();

    switch (unit) {
      case "n":
        return { step: token.value, offset: parseOffset(stream) };

      case "n-":
        return { step: token.value, offset: -1 * parseOffset(stream, true) };
    }

    {
      const stream = new Stream(unit.length, i => unit.charCodeAt(i));

      let next = stream.peek(0);

      if (next === null || next !== Char.SmallLetterN) {
        return null;
      }

      stream.advance(1);
      next = stream.peek(0);

      if (next === null || next !== Char.HyphenMinus) {
        return null;
      }

      stream.advance(1);
      next = stream.peek(0);

      if (next === null || !isNumeric(next)) {
        return null;
      }

      let offset = 0;

      while (next !== null && isNumeric(next)) {
        offset = offset * 10 + next - Char.DigitZero;

        stream.advance(1);
        next = stream.peek(0);
      }

      if (!stream.done()) {
        return null;
      }

      return { step: token.value, offset: -1 * offset };
    }

    return null;
  }
};

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix(token, stream) {
    const value = token.value.toLowerCase();

    switch (value) {
      case "n":
        return { step: 1, offset: parseOffset(stream) };

      case "-n":
        return { step: -1, offset: parseOffset(stream) };

      case "n-":
        return { step: 1, offset: -1 * parseOffset(stream, true) };

      case "-n-":
        return { step: -1, offset: -1 * parseOffset(stream, true) };

      case "even":
        return { step: 2, offset: 0 };

      case "odd":
        return { step: 2, offset: 1 };
    }

    {
      const stream = new Stream(value.length, i => value.charCodeAt(i));

      let step = 1;
      let next = stream.peek(0);

      if (next !== null && next === Char.HyphenMinus) {
        step = -1;

        stream.advance(1);
        next = stream.peek(0);
      }

      if (next === null || next !== Char.SmallLetterN) {
        return null;
      }

      stream.advance(1);
      next = stream.peek(0);

      if (next === null || next !== Char.HyphenMinus) {
        return null;
      }

      stream.advance(1);
      next = stream.peek(0);

      if (next === null || !isNumeric(next)) {
        return null;
      }

      let offset = 0;

      while (next !== null && isNumeric(next)) {
        offset = offset * 10 + next - Char.DigitZero;

        stream.advance(1);
        next = stream.peek(0);
      }

      if (!stream.done()) {
        return null;
      }

      return { step, offset: -1 * offset };
    }
  }
};

const delim: Production<Tokens.Delim> = {
  token: TokenType.Delim,
  prefix(token, stream, expression) {
    switch (token.value) {
      case Char.PlusSign: {
        const next = stream.peek(0);

        if (next === null || next.type !== TokenType.Ident) {
          break;
        }

        return expression();
      }
    }

    return null;
  }
};

export const ChildIndexGrammar: Grammar<Token, ChildIndex> = new Lang.Grammar(
  [[skip(TokenType.Whitespace), dimension, ident, number, delim]],
  () => null
);

function parseOffset(stream: Stream<Token>, signless = false): number {
  stream.accept(token => token.type === TokenType.Whitespace);

  let next = stream.peek(0);

  if (next === null) {
    return 0;
  }

  let sign: number | null = null;

  if (next.type === TokenType.Delim) {
    if (signless) {
      return 0;
    }

    switch (next.value) {
      case Char.PlusSign:
        sign = 1;
        break;
      case Char.HyphenMinus:
        sign = -1;
        break;
      default:
        return 0;
    }

    stream.advance(1);
    stream.accept(token => token.type === TokenType.Whitespace);

    signless = true;
    next = stream.peek(0);

    if (next === null) {
      return 0;
    }
  }

  if (
    next.type !== TokenType.Number ||
    !next.integer ||
    signless === next.signed
  ) {
    return 0;
  }

  stream.advance(1);

  return sign === null ? next.value : sign * next.value;
}
