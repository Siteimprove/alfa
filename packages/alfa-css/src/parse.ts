import { lex, parse } from "@siteimprove/alfa-lang";
import { Alphabet } from "./alphabet";

import { Declaration, DeclarationGrammar } from "./grammars/declaration";
import { Rule, RuleGrammar } from "./grammars/rule";
import { Selector, SelectorGrammar } from "./grammars/selector";

export function parseDeclaration(
  input: string
): Declaration | Array<Declaration> | null {
  return parse(lex(input, Alphabet), DeclarationGrammar);
}

export function parseRule(input: string): Rule | Array<Rule> | null {
  return parse(lex(input, Alphabet), RuleGrammar);
}

export function parseSelector(
  input: string
): Selector | Array<Selector> | null {
  return parse(lex(input, Alphabet), SelectorGrammar);
}
