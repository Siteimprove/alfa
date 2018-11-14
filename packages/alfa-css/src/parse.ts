import { lex, parse } from "@siteimprove/alfa-lang";
import { Alphabet } from "./alphabet";
import { Declaration, MediaQuery, Rule, Selector } from "./types";

import { DeclarationGrammar } from "./grammars/declaration";
import { MediaGrammar } from "./grammars/media";
import { RuleGrammar } from "./grammars/rule";
import { SelectorGrammar } from "./grammars/selector";

export function parseDeclaration(
  input: string
): Declaration | Array<Declaration> | null {
  const lexer = lex(input, Alphabet);

  if (!lexer.done) {
    return null;
  }

  const parser = parse(lexer.result, DeclarationGrammar);

  if (!parser.done) {
    return null;
  }

  return parser.result;
}

export function parseMediaQuery(
  input: string
): MediaQuery | Array<MediaQuery> | null {
  const lexer = lex(input, Alphabet);

  if (!lexer.done) {
    return null;
  }

  const parser = parse(lexer.result, MediaGrammar);

  if (!parser.done) {
    return null;
  }

  return parser.result;
}

export function parseRule(input: string): Rule | Array<Rule> | null {
  const lexer = lex(input, Alphabet);

  if (!lexer.done) {
    return null;
  }

  const parser = parse(lexer.result, RuleGrammar);

  if (!parser.done) {
    return null;
  }

  return parser.result;
}

export function parseSelector(
  input: string
): Selector | Array<Selector> | null {
  const lexer = lex(input, Alphabet);

  if (!lexer.done) {
    return null;
  }

  const parser = parse(lexer.result, SelectorGrammar);

  if (!parser.done) {
    return null;
  }

  return parser.result;
}
