import { Token, type Parser as CSSParser } from "@siteimprove/alfa-css";
import { Err } from "@siteimprove/alfa-result";
import { Parser } from "@siteimprove/alfa-parser";

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

const { right } = Parser;
const { parseNonFunctional } = PseudoClassSelector;

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

  const nonFunctionalConstructors: Record<string, () => PseudoClass> = {
    active: Active.of,
    "any-link": AnyLink.of,
    checked: Checked.of,
    disabled: Disabled.of,
    empty: Empty.of,
    enabled: Enabled.of,
    "first-child": FirstChild.of,
    "first-of-type": FirstOfType.of,
    focus: Focus.of,
    "focus-visible": FocusVisible.of,
    "focus-within": FocusWithin.of,
    host: Host.of,
    hover: Hover.of,
    "last-child": LastChild.of,
    "last-of-type": LastOfType.of,
    link: Link.of,
    "only-child": OnlyChild.of,
    "only-of-type": OnlyOfType.of,
    root: Root.of,
    visited: Visited.of,
  };

  const functionalParsers = (
    parseSelector: Selector.Parser.Component,
  ): Record<string, CSSParser<PseudoClass>> => {
    return {
      has: Has.parse(parseSelector, false),
      host: Host.parseFunctional(parseSelector, false),
      "host-context": HostContext.parse(parseSelector, false),
      is: Is.parse(parseSelector, false),
      not: Not.parse(parseSelector, false),
      "nth-child": NthChild.parse(parseSelector, false),
      "nth-last-child": NthLastChild.parse(parseSelector, false),
      "nth-last-of-type": NthLastOfType.parse(false),
      "nth-of-type": NthOfType.parse(false),
      where: Where.parse(parseSelector, false),
    };
  };

  /**
   * @privateRemarks
   * This function is a hot path and uses token lookahead instead
   * of the `either` parser combinator to avoid backtracking. Any changes to
   * this function should be benchmarked.
   */
  export function parseWithoutColon(
    parseSelector: Selector.Parser.Component,
  ): CSSParser<PseudoClass> {
    return (input) => {
      if (input.isEmpty()) {
        return Err.of("Unexpected end of input");
      }
      const funcOrIdent = input.getUnsafe(0); // Safe due to emptiness check above

      // Function pseudo-classes must be checked first. If we checked for
      // ident tokens first, function tokens would never be reached since
      // Token.isIdent would also match the beginning of function tokens.
      if (Token.isFunction(funcOrIdent)) {
        const name = funcOrIdent.value.toLowerCase();
        const parser = functionalParsers(parseSelector)[name];
        return parser !== undefined
          ? parser(input)
          : Err.of(`Unknown pseudo-class function: ${name}`);
      }

      // Non-functional pseudo-classes
      if (Token.isIdent(funcOrIdent)) {
        const name = funcOrIdent.value.toLowerCase();
        const of = nonFunctionalConstructors[name];
        return of !== undefined
          ? parseNonFunctional(name, of, false)(input)
          : Err.of(`Unknown pseudo-class: ${name}`);
      }

      return Err.of("Expected ident or function after colon");
    };
  }

  export function parse(
    parseSelector: Selector.Parser.Component,
  ): CSSParser<PseudoClass> {
    return right(Token.parseColon, parseWithoutColon(parseSelector));
  }
}
