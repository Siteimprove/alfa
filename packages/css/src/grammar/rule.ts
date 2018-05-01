import * as Lang from "@alfa/lang";
import { Grammar, Stream } from "@alfa/lang";
import { Token, Whitespace, Ident, Delim, Bracket } from "../alphabet";
import { AtRule, QualifiedRule, atRule, qualifiedRule } from "../grammar";

const { isArray } = Array;

type Rule = AtRule | QualifiedRule;

function rule(stream: Stream<Token>): Rule | null {
  stream.backup();

  return qualifiedRule(stream);
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

const whitespace: Production<Whitespace> = {
  token: "whitespace",
  prefix() {
    return null;
  },
  infix() {
    return null;
  }
};

const ident: Production<Ident> = {
  token: "ident",
  prefix(token, stream) {
    return rule(stream);
  },
  infix(token, stream, expression, left) {
    return ruleList(stream, expression, left);
  }
};

const delim: Production<Delim> = {
  token: "delim",
  prefix(token, stream) {
    stream.backup();
    return qualifiedRule(stream);
  }
};

const bracket: Production<Bracket> = {
  token: "[",
  prefix(token, stream) {
    stream.backup();
    return qualifiedRule(stream);
  }
};

export const RuleGrammar: Grammar<
  Token,
  AtRule | QualifiedRule | Array<AtRule | QualifiedRule>
> = new Grammar([ident, delim, whitespace]);
