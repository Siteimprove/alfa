import { Token, type Token as CSSToken } from "@siteimprove/alfa-css";
import { Parser, type Parser as CSSParser } from "@siteimprove/alfa-parser";
import { Err } from "@siteimprove/alfa-result";
import type { Slice } from "@siteimprove/alfa-slice";

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

const { either } = Parser;

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
   * @privateRemarks
   * This function is a hot path and uses token lookahead for simple cases
   * to avoid backtracking. Any changes to this function should be benchmarked.
   *
   * @internal
   */
  export const parse = (
    parseSelector: Selector.Parser.Component,
  ): CSSParser<Slice<CSSToken>, Simple, string> => {
    return (input: Slice<CSSToken>) => {
      if (input.isEmpty()) {
        return Err.of("Unexpected end of input");
      }

      const first = input.getUnsafe(0); // Safe due to emptiness check above

      if (Token.isDelim(first) && first.value === 0x2e /* . */) {
        return Class.parse(input);
      }

      if (Token.isHash(first)) {
        return Id.parse(input);
      }

      if (Token.isOpenSquareBracket(first)) {
        return Attribute.parse(input);
      }

      if (Token.isColon(first)) {
        let isDoubleColon = false;
        input = input.rest();
        if (!input.isEmpty() && Token.isColon(input.getUnsafe(0))) {
          input = input.rest();
          isDoubleColon = true;
        }
        return either<Slice<CSSToken>, Simple, string>(
          PseudoElement.parseWithoutColon(parseSelector, isDoubleColon),
          PseudoClass.parseWithoutColon(parseSelector),
        )(input);
      }

      return either<Slice<CSSToken>, Simple, string>(
        Type.parse,
        Universal.parse,
      )(input);
    };
  };
}
