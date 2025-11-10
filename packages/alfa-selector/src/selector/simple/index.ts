import type { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import type { Thunk } from "@siteimprove/alfa-thunk";

import type { Absolute, Selector as SelectorType } from "../index.js";
import { Selector } from "../selector.js";

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
   * @internal
   */
  export const parse = (
    parseSelector: Selector.ComponentParser<SelectorType>,
  ) =>
    either<Slice<Token>, Simple, string>(
      Class.parse,
      Type.parse,
      Attribute.parse,
      Id.parse,
      Universal.parse,
      PseudoClass.parse(parseSelector),
      PseudoElement.parse(parseSelector),
    );
}
