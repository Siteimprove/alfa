import { Token, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Err } from "@siteimprove/alfa-result";

import type { Selector } from "../index.js";

// Import the various simple selectors for use in that file.
import { Attribute } from "./attribute.js";
import { Class } from "./class.js";
import { Id } from "./id.js";
import { PseudoClass } from "../pseudo/pseudo-class/index.js";
import { PseudoElement } from "../pseudo/pseudo-element/index.js";
import { Type } from "./type.js";
import { Universal } from "./universal.js";

// Re-export the various selectors for use by others
export * from "./attribute.js";
export * from "./class.js";
export * from "./id.js";
export * from "../pseudo/pseudo-class/index.js";
export * from "../pseudo/pseudo-element/index.js";
export * from "./type.js";
export * from "./universal.js";

/**
 * {@link https://drafts.csswg.org/selectors/#simple}
 *
 * @public
 */
export type Simple =
  | Type
  | Universal
  | Attribute
  | Class
  | Id
  | PseudoClass
  | PseudoElement;

/**
 * @public
 */
export namespace Simple {
  export type JSON =
    | Type.JSON
    | Universal.JSON
    | Attribute.JSON
    | Class.JSON
    | Id.JSON
    | PseudoClass.JSON
    | PseudoElement.JSON;

  export function isSimple(value: unknown): value is Simple {
    return (
      Type.isType(value) ||
      Universal.isUniversal(value) ||
      Attribute.isAttribute(value) ||
      Class.isClass(value) ||
      Id.isId(value) ||
      PseudoClass.isPseudoClass(value)
    );
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-simple-selector}
   *
   * @remarks
   * This function is a hot path and uses token lookahead instead
   * of the `either` parser combinator to avoid backtracking. Any changes to
   * this function should be benchmarked.
   *
   * @internal
   */
  export const parse = (
    parseSelector: Selector.Parser.Component,
  ): CSSParser<Simple> => {
    return (input) => {
      if (input.isEmpty()) {
        return Err.of("Unexpected end of input");
      }

      const token = input.getUnsafe(0);

      if (Token.isDelim(token) && token.value === 0x2e /* '.' */) {
        return Class.parse(input);
      }

      if (Token.isHash(token)) {
        return Id.parse(input);
      }

      if (Token.isOpenSquareBracket(token)) {
        return Attribute.parse(input);
      }

      // Note: Single ':' can be either pseudo-class or legacy pseudo-element
      if (Token.isColon(token)) {
        if (input.has(1)) {
          const second = input.getUnsafe(1);
          if (Token.isColon(second)) {
            // Double colon: definitely a pseudo-element
            return PseudoElement.parse(parseSelector)(input);
          }
          // Single colon: check if it's a legacy pseudo-element name
          // Legacy pseudo-elements: before, after, first-line, first-letter
          if (Token.isIdent(second)) {
            const name = second.value.toLowerCase();
            if (
              name === "before" ||
              name === "after" ||
              name === "first-line" ||
              name === "first-letter"
            ) {
              return PseudoElement.parse(parseSelector)(input);
            }
          }
        }
        // Single colon with non-legacy name: pseudo-class
        return PseudoClass.parse(parseSelector)(input);
      }

      // For ident, '*', or '|': could be Type or Universal selector
      // Check second token to distinguish:
      // - '*|...' is Type with universal namespace
      // - '*' alone (or with namespace) is Universal
      // - ident is Type (or ident|* is Universal with namespace)
      if (Token.isIdent(token)) {
        // Starts with ident: Type or Universal with namespace
        return Type.parse(input);
      }

      if (Token.isDelim(token) && token.value === 0x2a) {
        // Starts with '*': could be '*|name' (Type) or '*|*' or '*' (Universal)
        if (input.has(1)) {
          const second = input.getUnsafe(1);
          if (Token.isDelim(second) && second.value === 0x7c) {
            // '*|...': check third token
            if (input.has(2)) {
              const third = input.getUnsafe(2);
              if (Token.isDelim(third) && third.value === 0x2a) {
                // '*|*' is Universal with universal namespace
                return Universal.parse(input);
              }
            }
            // '*|name' is a Type selector with universal namespace
            return Type.parse(input);
          }
        }
        // '*' alone is Universal
        return Universal.parse(input);
      }

      if (Token.isDelim(token) && token.value === 0x7c) {
        // Starts with '|': this is Type or Universal with empty namespace
        // Check second token: '|*' is Universal, '|name' is Type
        if (input.has(1)) {
          const second = input.getUnsafe(1);
          if (Token.isDelim(second) && second.value === 0x2a) {
            // '|*' is Universal with empty namespace
            return Universal.parse(input);
          }
        }
        // '|name' is Type with empty namespace
        return Type.parse(input);
      }

      return Err.of(`Unexpected token: ${token.type}`);
    };
  };
}
