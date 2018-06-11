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
        selectorText: serialize(rule.prelude),
        style: {
          cssText: serialize(rule.value)
        }
      });
    }
  }

  return { cssRules };
}

function serialize(tokens: Array<Token>): string {
  return tokens
    .reduce((result, token) => {
      switch (token.type) {
        case TokenType.Ident:
          return result + token.value;

        case TokenType.FunctionName:
          return result + `${token.value}(`;

        case TokenType.AtKeyword:
          return result + `@${token.value}`;

        case TokenType.String:
          return result + `${token.mark}${token.value}${token.mark}`;

        case TokenType.Url:
          return result + `url(${token.value})`;

        case TokenType.Delim:
          return result + fromCharCode(token.value);

        case TokenType.Number:
          return result + `${token.value}`;

        case TokenType.Percentage:
          return result + `${token.value * 100}%`;

        case TokenType.Dimension:
          return result + `${token.value}${token.unit}`;

        case TokenType.Whitespace:
          return result + " ";

        case TokenType.Colon:
          return result + ":";
        case TokenType.Semicolon:
          return result + ";";
        case TokenType.Comma:
          return result + ",";

        case TokenType.LeftParenthesis:
          return result + "(";
        case TokenType.RightParenthesis:
          return result + ")";
        case TokenType.LeftSquareBracket:
          return result + "[";
        case TokenType.RightSquareBracket:
          return result + "]";
        case TokenType.LeftCurlyBracket:
          return result + "{";
        case TokenType.RightCurlyBracket:
          return result + "}";
      }
    }, "")
    .trim();
}
