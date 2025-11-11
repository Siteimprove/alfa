import type { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import type { Slice } from "@siteimprove/alfa-slice";
import type { Thunk } from "@siteimprove/alfa-thunk";

import { type Absolute } from "../../index.js";
import { BaseSelector } from "../../selector.js";

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

const { either } = Parser;

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

  export function parse(
    parseSelector: BaseSelector.ComponentParser,
  ): CSSParser<PseudoClass> {
    return either<Slice<Token>, PseudoClass, string>(
      Active.parse,
      AnyLink.parse,
      Checked.parse,
      Disabled.parse,
      Empty.parse,
      Enabled.parse,
      FirstChild.parse,
      FirstOfType.parse,
      Focus.parse,
      FocusVisible.parse,
      FocusWithin.parse,
      Host.parse(parseSelector),
      HostContext.parse(parseSelector),
      Hover.parse,
      LastChild.parse,
      LastOfType.parse,
      Link.parse,
      OnlyChild.parse,
      OnlyOfType.parse,
      Root.parse,
      Visited.parse,
      NthChild.parse(parseSelector),
      NthLastChild.parse(parseSelector),
      NthLastOfType.parse,
      NthOfType.parse,
      Has.parse(parseSelector),
      Is.parse(parseSelector),
      Not.parse(parseSelector),
      Where.parse(parseSelector),
    );
  }
}
