import { Token, TokenType, Rule, parseRule } from "@siteimprove/alfa-css";
import { StyleSheet, RuleType, StyleRule } from "./types";

const { isArray } = Array;
const { fromCharCode } = String;

/**
 * @internal
 */
export function parseStyleSheet(input: string): StyleSheet {
  const cssRules: Array<StyleRule> = [];
  const rules: Rule | Array<Rule> | null = parseRule(input);

  if (rules === null) {
    return { cssRules };
  }

  for (const rule of isArray(rules) ? rules : [rules]) {
    if (rule.type === "qualified-rule") {
      cssRules.push({
        type: RuleType.Style,
        selectorText: serializeTokenList(rule.prelude),
        style: {
          cssText: serializeTokenList(rule.value)
        }
      });
    }
  }

  return { cssRules };
}

function serializeTokenList(tokens: Array<Token>): string {
  let result = "";

  for (let i = 0, n = tokens.length; i < n; i++) {
    result += serializeToken(tokens[i]);
  }

  return result.trim();
}

function serializeToken(token: Token): string {
  switch (token.type) {
    case TokenType.Ident:
      return token.value;

    case TokenType.FunctionName:
      return `${token.value}(`;

    case TokenType.AtKeyword:
      return `@${token.value}`;

    case TokenType.String:
      return `${token.mark}${token.value}${token.mark}`;

    case TokenType.Url:
      return `url(${token.value})`;

    case TokenType.Delim:
      return fromCharCode(token.value);

    case TokenType.Number:
      return `${token.value}`;

    case TokenType.Percentage:
      return `${token.value * 100}%`;

    case TokenType.Dimension:
      return `${token.value}${token.unit}`;

    case TokenType.Whitespace:
      return " ";

    case TokenType.Colon:
      return ":";
    case TokenType.Semicolon:
      return ";";
    case TokenType.Comma:
      return ",";

    case TokenType.LeftParenthesis:
      return "(";
    case TokenType.RightParenthesis:
      return ")";
    case TokenType.LeftSquareBracket:
      return "[";
    case TokenType.RightSquareBracket:
      return "]";
    case TokenType.LeftCurlyBracket:
      return "{";
    case TokenType.RightCurlyBracket:
      return "}";
  }
}
