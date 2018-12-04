import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, skip, Stream } from "@siteimprove/alfa-lang";
import { Mutable } from "@siteimprove/alfa-util";
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

      next = stream.peek(0);

      if (condition !== null) {
        assign(query, { condition });
      }
    }

    if (next !== null && next.type !== TokenType.Comma) {
      return null;
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
  let feature = mediaNot(stream);

  if (feature !== null) {
    return {
      operator: MediaOperator.Not,
      features: [feature]
    };
  }

  feature = mediaInParens(stream);

  if (feature !== null) {
    const condition: Mutable<MediaCondition> = {
      features: [feature]
    };

    while (!stream.done()) {
      stream.accept(token => token.type === TokenType.Whitespace);

      const feature = mediaAnd(stream);

      if (feature === null) {
        break;
      }

      condition.operator = MediaOperator.And;
      condition.features.push(feature);
    }

    if (allowOr && condition.operator !== MediaOperator.And) {
      while (!stream.done()) {
        stream.accept(token => token.type === TokenType.Whitespace);

        const feature = mediaOr(stream);

        if (feature === null) {
          break;
        }

        condition.operator = MediaOperator.Or;
        condition.features.push(feature);
      }
    }

    return condition;
  }

  return null;
}

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-not
 */
function mediaNot(stream: Stream<Token>): MediaFeature | MediaCondition | null {
  const start = stream.position();
  const next = stream.peek(0);

  if (next !== null && next.type === TokenType.Ident && next.value === "not") {
    stream.advance(1);
    stream.accept(token => token.type === TokenType.Whitespace);

    const feature = mediaInParens(stream);

    if (feature !== null) {
      return feature;
    }
  }

  stream.restore(start);

  return null;
}

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-and
 */
function mediaAnd(stream: Stream<Token>): MediaFeature | MediaCondition | null {
  const start = stream.position();
  const next = stream.peek(0);

  if (next !== null && next.type === TokenType.Ident && next.value === "and") {
    stream.advance(1);
    stream.accept(token => token.type === TokenType.Whitespace);

    const feature = mediaInParens(stream);

    if (feature !== null) {
      return feature;
    }
  }

  stream.restore(start);

  return null;
}

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-or
 */
function mediaOr(stream: Stream<Token>): MediaFeature | MediaCondition | null {
  const start = stream.position();
  const next = stream.peek(0);

  if (next !== null && next.type === TokenType.Ident && next.value === "or") {
    stream.advance(1);
    stream.accept(token => token.type === TokenType.Whitespace);

    const feature = mediaInParens(stream);

    if (feature !== null) {
      return feature;
    }
  }

  stream.restore(start);

  return null;
}

/**
 * @see https://www.w3.org/TR/mediaqueries/#typedef-media-in-parens
 */
function mediaInParens(
  stream: Stream<Token>
): MediaFeature | MediaCondition | null {
  const start = stream.position();

  let next = stream.peek(0);

  if (next !== null && next.type === TokenType.LeftParenthesis) {
    stream.advance(1);
    stream.accept(token => token.type === TokenType.Whitespace);

    const condition = mediaCondition(stream);

    if (condition !== null) {
      next = stream.peek(0);

      if (next !== null && next.type === TokenType.RightParenthesis) {
        stream.advance(1);
        stream.accept(token => token.type === TokenType.Whitespace);

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
              stream.accept(token => token.type === TokenType.Whitespace);

              value = Values.number(next.value);
              break;

            case TokenType.Dimension:
              if (Units.isLength(next.unit)) {
                stream.advance(1);
                stream.accept(token => token.type === TokenType.Whitespace);

                value = Values.length(next.value, next.unit);
              }
              break;

            case TokenType.Ident:
              stream.advance(1);
              stream.accept(token => token.type === TokenType.Whitespace);

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
        stream.accept(token => token.type === TokenType.Whitespace);

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
