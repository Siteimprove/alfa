import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip, Stream } from "@siteimprove/alfa-lang";
import { Token, Tokens, TokenType } from "../alphabet";
import {
  MediaCondition,
  MediaFeature,
  MediaOperator,
  MediaQualifier,
  MediaQuery
} from "../types";
import { Units } from "../units";
import { Value, Values } from "../values";

const { assign } = Object;

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-query
 */
function mediaQuery(stream: Stream<Token>): MediaQuery | null {
  const condition = mediaCondition(stream);

  if (condition !== null) {
    return { condition };
  }

  let next = stream.peek(0);

  if (next !== null && next.type === TokenType.Ident) {
    let qualifier: MediaQualifier | null = null;

    if (next.value === "not") {
      qualifier = MediaQualifier.Not;
    }

    if (next.value === "only") {
      qualifier = MediaQualifier.Only;
    }

    if (qualifier !== null) {
      stream.advance(1);
      stream.accept(token => token.type === TokenType.Whitespace);

      next = stream.peek(0);

      if (next === null || next.type !== TokenType.Ident) {
        stream.accept(token => token.type !== TokenType.Comma);
        return null;
      }
    }

    const query = { type: next.value };

    if (qualifier !== null) {
      assign(query, { qualifier });
    }

    stream.advance(1);
    stream.accept(token => token.type === TokenType.Whitespace);

    next = stream.peek(0);

    if (
      next !== null &&
      next.type === TokenType.Ident &&
      next.value === "and"
    ) {
      stream.advance(1);
      stream.accept(token => token.type === TokenType.Whitespace);

      const condition = mediaCondition(stream, false);

      if (condition !== null) {
        assign(query, { condition });
      }
    }

    return query;
  }

  stream.accept(token => token.type !== TokenType.Comma);
  return null;
}

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-condition
 */
function mediaCondition(
  stream: Stream<Token>,
  allowOr = true
): MediaCondition | null {
  const start = stream.position();

  let operator: MediaOperator | null = null;

  const next = stream.peek(0);

  if (next !== null && next.type === TokenType.Ident) {
    switch (next.value) {
      case "not":
        operator = MediaOperator.Not;
        break;
      case "and":
        operator = MediaOperator.And;
        break;
      case "or":
        if (!allowOr) {
          return null;
        }

        operator = MediaOperator.Or;
    }
  }

  if (operator !== null) {
    stream.advance(1);
    stream.accept(token => token.type === TokenType.Whitespace);
  }

  const feature = mediaInParens(stream);

  if (feature !== null) {
    const condition = { feature };

    if (operator !== null) {
      assign(condition, { operator });
    }

    return condition;
  }

  stream.restore(start);

  return null;
}

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-in-parens
 */
function mediaInParens(
  stream: Stream<Token>
): MediaFeature | MediaCondition | Array<MediaCondition> | null {
  const start = stream.position();

  let next = stream.peek(0);

  if (next !== null && next.type === TokenType.LeftParenthesis) {
    stream.advance(1);

    const condition = mediaCondition(stream);

    if (condition !== null) {
      next = stream.peek(0);

      if (next !== null && next.type === TokenType.RightParenthesis) {
        stream.advance(1);

        return condition;
      }
    }
  }

  stream.restore(start);

  return mediaFeature(stream);
}

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-feature
 */
function mediaFeature(stream: Stream<Token>): MediaFeature | null {
  const start = stream.position();

  let next = stream.peek(0);

  if (next !== null && next.type === TokenType.LeftParenthesis) {
    stream.advance(1);
    stream.accept(token => token.type === TokenType.Whitespace);

    next = stream.peek(0);

    if (next !== null && next.type === TokenType.Ident) {
      const feature = { name: next.value };

      stream.advance(1);
      stream.accept(token => token.type === TokenType.Whitespace);

      next = stream.peek(0);

      if (next !== null && next.type === TokenType.Colon) {
        stream.advance(1);
        stream.accept(token => token.type === TokenType.Whitespace);

        next = stream.peek(0);

        let value: Value | null = null;

        if (next !== null) {
          switch (next.type) {
            case TokenType.Number:
              stream.advance(1);
              value = Values.number(next.value);
              break;

            case TokenType.Dimension:
              if (Units.isLength(next.unit)) {
                stream.advance(1);
                value = Values.length(next.value, next.unit);
              }
              break;

            case TokenType.Ident:
              stream.advance(1);
              value = Values.string(next.value);
          }
        }

        if (value === null) {
          stream.restore(start);

          return null;
        }

        assign(feature, { value });
      }

      stream.accept(token => token.type === TokenType.Whitespace);

      next = stream.peek(0);

      if (next !== null && next.type === TokenType.RightParenthesis) {
        stream.advance(1);
        return feature;
      }
    }
  }

  stream.restore(start);

  return null;
}

type Production<T extends Token> = Lang.Production<Token, MediaQuery, T>;

const ident: Production<Tokens.Ident> = {
  token: TokenType.Ident,
  prefix: (token, stream) => {
    stream.backup(1);
    return mediaQuery(stream);
  }
};

const parenthesis: Production<Tokens.Parenthesis> = {
  token: TokenType.LeftParenthesis,
  prefix: (token, stream) => {
    stream.backup(1);
    return mediaQuery(stream);
  }
};

export const MediaGrammar: Grammar<Token, MediaQuery> = new Grammar(
  [skip(TokenType.Whitespace), ident, parenthesis],
  () => null
);
