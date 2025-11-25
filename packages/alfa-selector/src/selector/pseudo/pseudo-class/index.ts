import { Token, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Err } from "@siteimprove/alfa-result";

import { type Selector } from "../../index.js";

import { Active } from "./active.js";
import { AnyLink } from "./any-link.js";
import { Checked } from "./checked.js";
import { Disabled } from "./disabled.js";
import { Empty } from "./empty.js";
import { Enabled } from "./enabled.js";
import { FirstChild } from "./first-child.js";
import { FirstOfType } from "./first-of-type.js";
import { Focus } from "./focus.js";
import { FocusVisible } from "./focus-visible.js";
import { FocusWithin } from "./focus-within.js";
import { Has } from "./has.js";
import { Host } from "./host.js";
import { HostContext } from "./host-context.js";
import { Hover } from "./hover.js";
import { Is } from "./is.js";
import { LastChild } from "./last-child.js";
import { LastOfType } from "./last-of-type.js";
import { Link } from "./link.js";
import { Not } from "./not.js";
import { NthChild } from "./nth-child.js";
import { NthLastChild } from "./nth-last-child.js";
import { NthLastOfType } from "./nth-last-of-type.js";
import { NthOfType } from "./nth-of-type.js";
import { OnlyChild } from "./only-child.js";
import { OnlyOfType } from "./only-of-type.js";
import { Root } from "./root.js";
import { Visited } from "./visited.js";
import { Where } from "./where.js";

import { PseudoClassSelector } from "./pseudo-class.js";

/**
 * @public
 */
export type PseudoClass =
  | Active
  | AnyLink
  | Checked
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
  | HostContext
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
  | Visited
  | Where;

/**
 * @public
 */
export namespace PseudoClass {
  export type JSON =
    | Active.JSON
    | AnyLink.JSON
    | Checked.JSON
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
    | HostContext.JSON
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
    | Visited.JSON
    | Where.JSON;

  export function isPseudoClass(value: unknown): value is PseudoClass {
    // Note: this is not totally true as we could extend PseudoClassSelector
    // without making it a PseudoClass. We're likely having other problems in
    // that case…
    return value instanceof PseudoClassSelector;
  }

  export const { isHost } = Host;

  /**
   * @remarks
   * This function is a hot path and uses token lookahead instead
   * of the `either` parser combinator to avoid backtracking. Any changes to
   * this function should be benchmarked.
   */
  export function parse(
    parseSelector: Selector.Parser.Component,
  ): CSSParser<PseudoClass> {
    return (input) => {
      if (input.length < 2) {
        return Err.of("Unexpected end of input");
      }

      const first = input.getUnsafe(0);
      if (!Token.isColon(first)) {
        return Err.of("Expected colon");
      }

      const second = input.getUnsafe(1);

      // Check for function pseudo-classes
      if (Token.isFunction(second)) {
        const name = second.value.toLowerCase();
        switch (name) {
          case "has":
            return Has.parse(parseSelector)(input);
          case "host":
            return Host.parse(parseSelector)(input);
          case "host-context":
            return HostContext.parse(parseSelector)(input);
          case "is":
            return Is.parse(parseSelector)(input);
          case "not":
            return Not.parse(parseSelector)(input);
          case "nth-child":
            return NthChild.parse(parseSelector)(input);
          case "nth-last-child":
            return NthLastChild.parse(parseSelector)(input);
          case "nth-last-of-type":
            return NthLastOfType.parse(input);
          case "nth-of-type":
            return NthOfType.parse(input);
          case "where":
            return Where.parse(parseSelector)(input);
        }
        return Err.of(`Unknown pseudo-class function: ${name}`);
      }

      // Check for non-functional pseudo-classes
      if (Token.isIdent(second)) {
        const name = second.value.toLowerCase();
        switch (name) {
          case "active":
            return Active.parse(input);
          case "any-link":
            return AnyLink.parse(input);
          case "checked":
            return Checked.parse(input);
          case "disabled":
            return Disabled.parse(input);
          case "empty":
            return Empty.parse(input);
          case "enabled":
            return Enabled.parse(input);
          case "first-child":
            return FirstChild.parse(input);
          case "first-of-type":
            return FirstOfType.parse(input);
          case "focus":
            return Focus.parse(input);
          case "focus-visible":
            return FocusVisible.parse(input);
          case "focus-within":
            return FocusWithin.parse(input);
          case "host":
            // :host can be either :host or :host(selector)
            return Host.parse(parseSelector)(input);
          case "hover":
            return Hover.parse(input);
          case "last-child":
            return LastChild.parse(input);
          case "last-of-type":
            return LastOfType.parse(input);
          case "link":
            return Link.parse(input);
          case "only-child":
            return OnlyChild.parse(input);
          case "only-of-type":
            return OnlyOfType.parse(input);
          case "root":
            return Root.parse(input);
          case "visited":
            return Visited.parse(input);
        }
        return Err.of(`Unknown pseudo-class: ${name}`);
      }

      return Err.of("Expected ident or function after colon");
    };
  }
}
