import type { Parser as CSSParser, Token } from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Refinement } from "@siteimprove/alfa-refinement";
import type { Slice } from "@siteimprove/alfa-slice";
import type { Thunk } from "@siteimprove/alfa-thunk";

import { type Absolute, Simple } from "../../index";
import { Compound } from "../../compound";

import { Active } from "./active";
import { Disabled } from "./disabled";
import { Empty } from "./empty";
import { Enabled } from "./enabled";
import { FirstChild } from "./first-child";
import { FirstOfType } from "./first-of-type";
import { Focus } from "./focus";
import { FocusVisible } from "./focus-visible";
import { FocusWithin } from "./focus-within";
import { Has } from "./has";
import { Host } from "./host";
import { Hover } from "./hover";
import { Is } from "./is";
import { LastChild } from "./last-child";
import { LastOfType } from "./last-of-type";
import { Link } from "./link";
import { Not } from "./not";
import { NthChild } from "./nth-child";
import { NthLastChild } from "./nth-last-child";
import { NthLastOfType } from "./nth-last-of-type";
import { NthOfType } from "./nth-of-type";
import { OnlyChild } from "./only-child";
import { OnlyOfType } from "./only-of-type";
import { Root } from "./root";
import { Visited } from "./visited";
import { Where } from "./where";

import { PseudoClassSelector } from "./pseudo-class";

const { either, filter } = Parser;
const { or } = Refinement;

/**
 * @public
 */
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
  | Visited
  | Where;

/**
 * @public
 */
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
      Host.parse(() =>
        filter(
          parseSelector(),
          or(Compound.isCompound, Simple.isSimple),
          () => ":host() only accepts compound selectors",
        ),
      ),
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
