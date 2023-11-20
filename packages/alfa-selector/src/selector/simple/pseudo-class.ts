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
  PseudoClassSelector,
  Root,
  Visited,
} from "./pseudo-class/index";

const { either } = Parser;
const {
  parseFunctionalWithNth,
  parseFunctionalWithSelector,
  parseNonFunctional,
} = PseudoClassSelector;

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
    | PseudoClassSelector.JSON<"active">
    | PseudoClassSelector.JSON<"disabled">
    | PseudoClassSelector.JSON<"empty">
    | PseudoClassSelector.JSON<"enabled">
    | PseudoClassSelector.JSON<"first-child">
    | PseudoClassSelector.JSON<"first-of-type">
    | PseudoClassSelector.JSON<"focus">
    | PseudoClassSelector.JSON<"focus-visible">
    | PseudoClassSelector.JSON<"focus-within">
    | Has.JSON
    | PseudoClassSelector.JSON<"host">
    | PseudoClassSelector.JSON<"hover">
    | Is.JSON
    | PseudoClassSelector.JSON<"Last-child">
    | PseudoClassSelector.JSON<"last-of-type">
    | PseudoClassSelector.JSON<"link">
    | Not.JSON
    | NthChild.JSON
    | NthLastChild.JSON
    | NthLastOfType.JSON
    | NthOfType.JSON
    | PseudoClassSelector.JSON<"only-child">
    | PseudoClassSelector.JSON<"only-of-type">
    | PseudoClassSelector.JSON<"root">
    | PseudoClassSelector.JSON<"visited">;

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
      parseNonFunctional("hover", Hover.of),
      parseNonFunctional("active", Active.of),
      parseNonFunctional("focus", Focus.of),
      parseNonFunctional("focus-within", FocusWithin.of),
      parseNonFunctional("focus-visible", FocusVisible.of),
      parseNonFunctional("link", Link.of),
      parseNonFunctional("visited", Visited.of),
      parseNonFunctional("disabled", Disabled.of),
      parseNonFunctional("enabled", Enabled.of),
      parseNonFunctional("root", Root.of),
      parseNonFunctional("host", Host.of),
      parseNonFunctional("empty", Empty.of),
      parseNonFunctional("first-child", FirstChild.of),
      parseNonFunctional("last-child", LastChild.of),
      parseNonFunctional("only-child", OnlyChild.of),
      parseNonFunctional("first-of-type", FirstOfType.of),
      parseNonFunctional("last-of-type", LastOfType.of),
      parseNonFunctional("only-of-type", OnlyOfType.of),

      parseFunctionalWithNth("nth-child", NthChild.of),
      parseFunctionalWithNth("nth-last-child", NthLastChild.of),
      parseFunctionalWithNth("nth-of-type", NthOfType.of),
      parseFunctionalWithNth("nth-last-of-type", NthLastOfType.of),
      // :has() normally only accepts relative selectors, we currently
      // accept only non-relative ones…
      parseFunctionalWithSelector("has", parseSelector, Has.of),
      parseFunctionalWithSelector("is", parseSelector, Is.of),
      parseFunctionalWithSelector("not", parseSelector, Not.of),
    );
  }
}
