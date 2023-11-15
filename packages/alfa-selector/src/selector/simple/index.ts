import type { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";

// Import the various selectors for use in that file.
import { Attribute } from "./attribute";
import { Class } from "./class";
import { Id } from "./id";
import { PseudoClass } from "./pseudo-class";
import { PseudoElement } from "./pseudo-element";
import { Type } from "./type";
import { Universal } from "./universal";

// Re-export the various selectors for use by others
export * from "./attribute";
export * from "./class";
export * from "./id";
export * from "./pseudo-class";
export * from "./pseudo-element";
export * from "./type";
export * from "./universal";

import type { Complex } from "../complex";
import type { Compound } from "../compound";
import type { List } from "../list";

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
  export const parse = (
    parseSelector: () => CSSParser<
      Simple | Compound | Complex | List<Simple | Compound | Complex>
    >,
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
