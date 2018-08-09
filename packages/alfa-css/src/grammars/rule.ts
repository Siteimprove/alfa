import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, Stream } from "@siteimprove/alfa-lang";
import {
  AtKeyword,
  Colon,
  Delim,
  Ident,
  SquareBracket,
  Token,
  TokenType
} from "../alphabet";
import { whitespace } from "../grammar";

const { isArray } = Array;

/**
 * @see https://www.w3.org/TR/css-syntax/#at-rule
 */
export interface AtRule {
  readonly type: "at-rule";
  readonly name: string;
  readonly prelude: Array<Token>;
  readonly value?: Array<Token>;
}

/**
 * @see https://www.w3.org/TR/css-syntax/#qualified-rule
 */
export interface QualifiedRule {
  readonly type: "qualified-rule";
  readonly prelude: Array<Token>;
  readonly value: Array<Token>;
}

export type Rule = AtRule | QualifiedRule;

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-at-rule
 */
function atRule(stream: Stream<Token>, name: string): AtRule {
  const prelude: Array<Token> = [];

  let next = stream.peek(0);

  while (next !== null && next.type !== TokenType.Semicolon) {
    if (next.type === TokenType.LeftCurlyBracket) {
      return {
        type: "at-rule",
        name,
        prelude,
        value: block(stream)
      };
    }

    prelude.push(next);

    stream.advance(1);
    next = stream.peek(0);
  }

  stream.advance(1);

  return {
    type: "at-rule",
    name,
    prelude
  };
}

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-a-qualified-rule
 */
function qualifiedRule(
  stream: Stream<Token>,
  prelude: Array<Token>
): QualifiedRule | null {
  let next = stream.peek(0);

  while (next !== null) {
    if (next.type === TokenType.LeftCurlyBracket) {
      return {
        type: "qualified-rule",
        prelude,
        value: block(stream)
      };
    }

    prelude.push(next);

    stream.advance(1);
    next = stream.peek(0);
  }

  return null;
}

function block(stream: Stream<Token>): Array<Token> {
  const values: Array<Token> = [];

  stream.advance(1);
  let next = stream.peek(0);

  while (next !== null && next.type !== TokenType.RightCurlyBracket) {
    values.push(next);
    stream.advance(1);
    next = stream.peek(0);
  }

  if (next !== null && next.type === TokenType.RightCurlyBracket) {
    stream.advance(1);
  }

  return values;
}

function rule(token: Token, stream: Stream<Token>): Rule | null {
  if (token.type === TokenType.AtKeyword) {
    return atRule(stream, token.value);
  }

  return qualifiedRule(stream, [token]);
}

function ruleList(
  stream: Stream<Token>,
  expression: () => Rule | Array<Rule> | null,
  left: Rule | Array<Rule>
): Array<Rule> {
  stream.backup(1);

  const rules: Array<Rule> = [];

  if (isArray(left)) {
    rules.push(...left);
  } else {
    rules.push(left);
  }

  const right = expression();

  if (right !== null) {
    if (isArray(right)) {
      rules.push(...right);
    } else {
      rules.push(right);
    }
  }

  return rules;
}

type Production<T extends Token> = Lang.Production<
  Token,
  Rule | Array<Rule>,
  T
>;

const ident: Production<Ident> = {
  token: TokenType.Ident,
  prefix(token, stream) {
    return rule(token, stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

const delim: Production<Delim> = {
  token: TokenType.Delim,
  prefix(token, stream) {
    return rule(token, stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

const colon: Production<Colon> = {
  token: TokenType.Colon,
  prefix(token, stream) {
    return rule(token, stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

const squareBracket: Production<SquareBracket> = {
  token: TokenType.LeftSquareBracket,
  prefix(token, stream) {
    return rule(token, stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

const atKeyword: Production<AtKeyword> = {
  token: TokenType.AtKeyword,
  prefix(token, stream) {
    return rule(token, stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

export const RuleGrammar: Grammar<Token, Rule | Array<Rule>> = new Grammar(
  [ident, delim, colon, squareBracket, atKeyword, whitespace],
  () => null
);
