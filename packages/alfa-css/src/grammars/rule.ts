import * as Lang from "@siteimprove/alfa-lang";
import { Grammar, Stream } from "@siteimprove/alfa-lang";
import { Token, Ident, Delim, Bracket, AtKeyword } from "../alphabet";
import { whitespace } from "../grammar";

const { isArray } = Array;

/**
 * @see https://www.w3.org/TR/css-syntax/#at-rule
 */
export type AtRule = {
  type: "at-rule";
  name: string;
  prelude: Array<Token>;
  value?: Array<Token>;
};

/**
 * @see https://www.w3.org/TR/css-syntax/#qualified-rule
 */
export type QualifiedRule = {
  type: "qualified-rule";
  prelude: Array<Token>;
  value: Array<Token>;
};

export type Rule = AtRule | QualifiedRule;

/**
 * @see https://www.w3.org/TR/css-syntax/#consume-an-at-rule
 */
function atRule(stream: Stream<Token>, name: string): AtRule {
  const prelude: Array<Token> = [];

  let next = stream.peek();

  while (next !== null && next.type !== ";") {
    if (next.type === "{") {
      return {
        type: "at-rule",
        name,
        prelude,
        value: block(stream, next.type)
      };
    }

    prelude.push(next);

    stream.advance();
    next = stream.peek();
  }

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
  let next = stream.peek();

  while (next !== null) {
    if (next.type === "{") {
      return {
        type: "qualified-rule",
        prelude,
        value: block(stream, next.type)
      };
    }

    prelude.push(next);

    stream.advance();
    next = stream.peek();
  }

  return null;
}

export function block<Name extends "[" | "(" | "{">(
  stream: Stream<Token>,
  name: Name
): Array<Token> {
  const values: Array<Token> = [];
  const mirror =
    name === "[" ? "]" : name === "(" ? ")" : name === "{" ? "}" : null;

  stream.advance();
  let next = stream.peek();

  while (next !== null && next.type !== mirror) {
    values.push(next);
    stream.advance();
    next = stream.peek();
  }

  if (next !== null && next.type === mirror) {
    stream.advance();
  }

  return values;
}

function rule(token: Token, stream: Stream<Token>): Rule | null {
  if (token.type === "at-keyword") {
    return atRule(stream, token.value);
  }

  return qualifiedRule(stream, [token]);
}

function ruleList(
  stream: Stream<Token>,
  expression: () => Rule | Array<Rule> | null,
  left: Rule | Array<Rule>
): Array<Rule> {
  stream.backup();

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
  token: "ident",
  prefix(token, stream) {
    return rule(token, stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

const delim: Production<Delim> = {
  token: "delim",
  prefix(token, stream) {
    return rule(token, stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

const bracket: Production<Bracket> = {
  token: "[",
  prefix(token, stream) {
    return rule(token, stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

const atKeyword: Production<AtKeyword> = {
  token: "at-keyword",
  prefix(token, stream) {
    return rule(token, stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

export const RuleGrammar: Grammar<Token, Rule | Array<Rule>> = new Grammar([
  ident,
  delim,
  bracket,
  atKeyword,
  whitespace
]);
