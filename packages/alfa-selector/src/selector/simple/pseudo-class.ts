import { type Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";
import { Thunk } from "@siteimprove/alfa-thunk";

import type { Absolute } from "../../selector";

import {
  Active,
  Disabled,
  Empty,
  Enabled,
  FirstChild,
  FirstOfType,
  Focus,
  FocusVisible,
  FocusWithin,
  Has,
  Host,
  Hover,
  Is,
  LastChild,
  LastOfType,
  Link,
  Not,
  NthChild,
  NthLastChild,
  NthLastOfType,
  NthOfType,
  OnlyChild,
  OnlyOfType,
  Root,
  Visited,
} from "./pseudo-class/index";

import { PseudoClassSelector } from "./pseudo-class/pseudo-class";

const { either } = Parser;

export type PseudoClass =
  | Active
  | Disabled
  | Empty
  | Enabled
  | FirstChild
  | FirstOfType
  | Focus
  | FocusVisible
  | FocusWithin
  | Has
  | Host
  | Hover
  | Is
  | LastChild
  | LastOfType
  | Link
  | Not
  | NthChild
  | NthLastChild
  | NthLastOfType
  | NthOfType
  | OnlyChild
  | OnlyOfType
  | Root
  | Visited;

export namespace PseudoClass {
  export type JSON =
    | Active.JSON
    | Disabled.JSON
    | Empty.JSON
    | Enabled.JSON
    | FirstChild.JSON
    | FirstOfType.JSON
    | Focus.JSON
    | FocusVisible.JSON
    | FocusWithin.JSON
    | Has.JSON
    | Host.JSON
    | Hover.JSON
    | Is.JSON
    | LastChild.JSON
    | LastOfType.JSON
    | Link.JSON
    | Not.JSON
    | NthChild.JSON
    | NthLastChild.JSON
    | NthLastOfType.JSON
    | NthOfType.JSON
    | OnlyChild.JSON
    | OnlyOfType.JSON
    | Root.JSON
    | Visited.JSON;

  export function isPseudoClass(value: unknown): value is PseudoClass {
    // Note: this is not totally true as we could extend PseudoClassSelector
    // without making it a PseudoClass. We're likely having other problems in
    // that case…
    return value instanceof PseudoClassSelector;
  }

  export function parse(
    parseSelector: Thunk<CSSParser<Absolute>>,
  ): CSSParser<PseudoClass> {
    return either<Slice<Token>, PseudoClass, string>(
      Active.parse,
      Disabled.parse,
      Empty.parse,
      Enabled.parse,
      FirstChild.parse,
      FirstOfType.parse,
      Focus.parse,
      FocusVisible.parse,
      FocusWithin.parse,
      Host.parse,
      Hover.parse,
      LastChild.parse,
      LastOfType.parse,
      Link.parse,
      OnlyChild.parse,
      OnlyOfType.parse,
      Root.parse,
      Visited.parse,
      NthChild.parse,
      NthLastChild.parse,
      NthLastOfType.parse,
      NthOfType.parse,
      Has.parse(parseSelector),
      Is.parse(parseSelector),
      Not.parse(parseSelector),
    );
  }
}
