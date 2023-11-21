import type { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import { Thunk } from "@siteimprove/alfa-thunk";

import type { Absolute } from "../selector";

// Import the various simple selectors for use in that file.
import {
  Attribute,
  Class,
  Id,
  PseudoClass,
  PseudoElement,
  Type,
  Universal,
} from "./simple";

// Re-export the various selectors for use by others
export * from "./simple/index";

const { either } = Parser;

/**
 * {@link https://drafts.csswg.org/selectors/#simple}
 */
export type Simple =
  | Type
  | Universal
  | Attribute
  | Class
  | Id
  | PseudoClass
  | PseudoElement;

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
      PseudoClass.isPseudoClass(value) ||
      PseudoElement.isPseudoElement(value)
    );
  }

  /**
   * {@link https://drafts.csswg.org/selectors/#typedef-simple-selector}
   *
   * @internal
   */
  export const parse = (parseSelector: Thunk<CSSParser<Absolute>>) =>
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
