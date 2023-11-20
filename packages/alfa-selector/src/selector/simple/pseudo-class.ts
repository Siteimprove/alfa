import {
  Function,
  Nth,
  type Parser as CSSParser,
  Token,
} from "@siteimprove/alfa-css";
import { Parser } from "@siteimprove/alfa-parser";
import { Err, Result } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

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
} from "../pseudo-class";

const { either, end, left, mapResult, peek, right } = Parser;

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

  const parseNth = left(
    Nth.parse,
    end((token) => `Unexpected token ${token}`),
  );

  export function parse(
    parseSelector: () => CSSParser<Absolute>,
  ): CSSParser<PseudoClass> {
    return right(
      Token.parseColon,
      either(
        // Non-functional pseudo-classes
        mapResult(Token.parseIdent(), (ident) => {
          switch (ident.value) {
            case "hover":
              return Result.of<PseudoClass, string>(Hover.of());
            case "active":
              return Result.of(Active.of());
            case "focus":
              return Result.of(Focus.of());
            case "focus-within":
              return Result.of(FocusWithin.of());
            case "focus-visible":
              return Result.of(FocusVisible.of());
            case "link":
              return Result.of(Link.of());
            case "visited":
              return Result.of(Visited.of());
            case "disabled":
              return Result.of(Disabled.of());
            case "enabled":
              return Result.of(Enabled.of());
            case "root":
              return Result.of(Root.of());
            case "host":
              return Result.of(Host.of());
            case "empty":
              return Result.of(Empty.of());
            case "first-child":
              return Result.of(FirstChild.of());
            case "last-child":
              return Result.of(LastChild.of());
            case "only-child":
              return Result.of(OnlyChild.of());
            case "first-of-type":
              return Result.of(FirstOfType.of());
            case "last-of-type":
              return Result.of(LastOfType.of());
            case "only-of-type":
              return Result.of(OnlyOfType.of());
          }

          return Err.of(`Unknown pseudo-class :${ident.value}`);
        }),

        // Functional pseudo-classes
        mapResult(
          right(peek(Token.parseFunction()), Function.consume),
          (fn) => {
            const { name } = fn;
            const tokens = Slice.of(fn.value);

            switch (name) {
              // :<name>(<selector-list>)
              // :has() normally only accepts relative selectors, we currently
              // accept all.
              case "is":
              case "not":
              case "has":
                return parseSelector()(tokens).map(([, selector]) => {
                  switch (name) {
                    case "is":
                      return Is.of(selector) as PseudoClass;
                    case "not":
                      return Not.of(selector);
                    case "has":
                      return Has.of(selector);
                  }
                });

              // :<name>(<an+b>)
              case "nth-child":
              case "nth-last-child":
              case "nth-of-type":
              case "nth-last-of-type":
                return parseNth(tokens).map(([, nth]) => {
                  switch (name) {
                    case "nth-child":
                      return NthChild.of(nth);
                    case "nth-last-child":
                      return NthLastChild.of(nth);
                    case "nth-of-type":
                      return NthOfType.of(nth);
                    case "nth-last-of-type":
                      return NthLastOfType.of(nth);
                  }
                });
            }

            return Err.of(`Unknown pseudo-class :${fn.name}()`);
          },
        ),
      ),
    );
  }
}
