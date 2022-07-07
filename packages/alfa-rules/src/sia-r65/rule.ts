import { Rule } from "@siteimprove/alfa-act";
import { Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Question } from "../common/act/question";
import { Scope } from "../tags";
import { ExtendedDiagnostic, Matches } from "./diagnostics";

const { isElement } = Element;
const { isKeyword } = Keyword;
const { or, test, xor } = Predicate;
const { hasBorder, hasBoxShadow, hasOutline, hasTextDecoration, isTabbable } =
  Style;

export default Rule.Atomic.of<Page, Element, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r65",
  requirements: [Criterion.of("2.4.7")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    let diagnostic = Map.empty<string, Matches>();

    const tabbables = document.tabOrder().filter(isTabbable(device));
    const nonTargets = document
      .descendants()
      .filter((node) => isElement(node) && !tabbables.includes(node));
    const targetClassnames = tabbables.flatMap((tabbable) => tabbable.classes);

    let nonTargetClassnames = Sequence.empty<string>();
    for (const nonTarget of nonTargets) {
      if (isElement(nonTarget)) {
        nonTargetClassnames = nonTargetClassnames.concat(nonTarget.classes);
      }
    }

    function setMatches(
      classname: string,
      isTarget: boolean
    ): Map<string, Matches> {
      const matches: Matches = diagnostic
        .get(classname)
        .getOr({ matchingTargets: 0, matchingNonTargets: 0 });

      const matchingTargets = isTarget
        ? matches.matchingTargets + 1
        : matches.matchingTargets;

      const matchingNonTargets = isTarget
        ? matches.matchingNonTargets
        : matches.matchingNonTargets + 1;

      return diagnostic.set(classname, {
        matchingTargets,
        matchingNonTargets,
      });
    }

    for (const targetClassname of targetClassnames) {
      diagnostic = setMatches(targetClassname, true);
    }

    for (const nonTargetClassname of nonTargetClassnames) {
      diagnostic = setMatches(nonTargetClassname, false);
    }

    return {
      applicability() {
        // Peak the first two tabbable elements to avoid forcing the whole
        // sequence. If the size of the resulting sequence is less than 2 then
        // fewer than 2 tabbable elements exist.
        if (tabbables.take(2).size < 2) {
          return [];
        }

        return tabbables;
      },

      expectations(target) {
        const askFocusIndicator = Question.of("has-focus-indicator", target);

        return {
          1: askFocusIndicator
            .answerIf(hasFocusIndicator(device)(target), true)
            .map((hasFocusIndicator) =>
              expectation(
                hasFocusIndicator,
                () => Outcomes.HasFocusIndicator(diagnostic),
                () => Outcomes.HasNoFocusIndicator(diagnostic)
              )
            ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasFocusIndicator = (diagnostic: Map<string, Matches>) =>
    Ok.of(
      ExtendedDiagnostic.of(
        `The element has a visible focus indicator`,
        diagnostic
      )
    );

  export const HasNoFocusIndicator = (diagnostic: Map<string, Matches>) =>
    Err.of(
      ExtendedDiagnostic.of(
        `The element does not have a visible focus indicator`,
        diagnostic
      )
    );
}

function hasFocusIndicator(device: Device): Predicate<Element> {
  return (element) => {
    const withFocus = Context.focus(element);

    return element
      .inclusiveDescendants(Node.flatTree)
      .concat(element.ancestors(Node.flatTree))
      .filter(isElement)
      .some(
        or(
          // For these properties, we assume that the difference is to set it or remove it, not to make small changes on it.
          xor(hasOutline(device), hasOutline(device, withFocus)),
          xor(hasTextDecoration(device), hasTextDecoration(device, withFocus)),
          xor(hasBoxShadow(device), hasBoxShadow(device, withFocus)),
          // These properties are essentially always set, so any difference in the color is good enough.
          hasDifferentColors(device, withFocus),
          hasDifferentBackgroundColors(device, withFocus),
          // Any difference in border is accepted
          hasDifferentBorder(device, withFocus)
        )
      );
  };
}

function hasDifferentColors(
  device: Device,
  context1: Context = Context.empty(),
  context2: Context = Context.empty()
): Predicate<Element> {
  return function hasDifferentColors(element: Element): boolean {
    const color1 = Style.from(element, device, context1).computed("color");
    const color2 = Style.from(element, device, context2).computed("color");

    // keywords can get tricky and may ultimately yield the same used value,
    // to keep on the safe side, we let the user decide if one color is a keyword.
    if (isKeyword(color1) || isKeyword(color2)) {
      return false;
    }

    return !color1.equals(color2);
  };
}

function hasDifferentBackgroundColors(
  device: Device,
  context1: Context = Context.empty(),
  context2: Context = Context.empty()
): Predicate<Element> {
  return function hasDifferentBackgroundColors(element: Element): boolean {
    const color1 = Style.from(element, device, context1).computed(
      "background-color"
    );
    const color2 = Style.from(element, device, context2).computed(
      "background-color"
    );

    // Keywords can get tricky and may ultimately yield the same used value,
    // to keep on the safe side, if one color is a keyword we let the user decide.
    if (isKeyword(color1) || isKeyword(color2)) {
      return false;
    }

    // Technically, different solid backgrounds could render as the same color if one is fully transparent
    // and the parent happens to have the same color… We Assume that this won't happen often…
    return !color1.equals(color2);
  };
}

function hasDifferentBorder(
  device: Device,
  context1: Context = Context.empty(),
  context2: Context = Context.empty()
): Predicate<Element> {
  return function hasDifferentBorder(element: Element): boolean {
    const style1 = Style.from(element, device, context1);
    const style2 = Style.from(element, device, context2);

    // If 0 or 1 has border, the answer is easy.
    const hasBorder1 = test(hasBorder(device, context1), element);
    const hasBorder2 = test(hasBorder(device, context2), element);

    if (hasBorder1 !== hasBorder2) {
      // only one has border
      return true;
    }

    if (!hasBorder1 && !hasBorder2) {
      // none has border
      return false;
    }

    // They both have border, we need to dig the values

    // We consider any difference in any of the border-* longhand as enough
    for (const side of ["top", "right", "bottom", "left"] as const) {
      for (const effect of ["color", "style", "width"] as const) {
        const longhand = `border-${side}-${effect}` as const;

        const border1 = style1.computed(longhand);
        const border2 = style2.computed(longhand);

        // We avoid keyword resolution for color,
        // but we need it for style. The none=hidden conflict has been solved
        // by hasBorder so any difference in style is enough.
        if (
          !(
            (effect === "color" &&
              (isKeyword(border1) || isKeyword(border2))) ||
            border1.equals(border2)
          )
        ) {
          return true;
        }
      }
    }

    return false;
  };
}
