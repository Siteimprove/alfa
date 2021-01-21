import { Rule } from "@siteimprove/alfa-act";
import { RGB } from "@siteimprove/alfa-css";
import {
  Element,
  Text,
  Namespace,
  Node,
  Attribute,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { getBackground, getForeground } from "../common/expectation/get-colors";

import {
  hasAttribute,
  hasRole,
  hasValue,
  isPerceivable,
  isLargeText,
} from "../common/predicate";

import { Outcomes } from "../common/outcome/contrast";

import { Question } from "../common/question";

import { Contrast } from "../common/diagnostic/contrast";

const { flatMap, map } = Iterable;
const { or, not, equals } = Predicate;
const { and, test } = Refinement;
const { min, max, round } = Math;
const { isElement } = Element;
const { isText } = Text;

export default Rule.Atomic.of<Page, Text, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r69.html",
  requirements: [Criterion.of("1.4.3"), Criterion.of("1.4.6")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(document);

        function* visit(node: Node): Iterable<Text> {
          if (
            test(
              and(
                isElement,
                or(
                  not(Element.hasNamespace(Namespace.HTML)),
                  hasRole((role) => role.isWidget()),
                  and(hasRole("group"), isSemanticallyDisabled)
                )
              ),
              node
            )
          ) {
            return;
          }

          if (test(and(isText, isPerceivable(device)), node)) {
            yield node;
          }

          const children = node.children({ flattened: true, nested: true });

          for (const child of children) {
            yield* visit(child);
          }
        }
      },

      expectations(target) {
        const foregrounds = Question.of(
          "foreground-colors",
          "color[]",
          target,
          "What are the foreground colors of the text node?"
        );

        const backgrounds = Question.of(
          "background-colors",
          "color[]",
          target,
          "What are the background colors of the text node?"
        );

        const result = foregrounds.map((foregrounds) =>
          backgrounds.map((backgrounds) => {
            const pairings = [
              ...flatMap(foregrounds, (foreground) =>
                map(backgrounds, (background) =>
                  Contrast.Pairing.of(
                    foreground,
                    background,
                    contrast(foreground, background)
                  )
                )
              ),
            ];

            const highest = pairings.reduce(
              (lowest, pairing) => max(lowest, pairing.contrast),
              0
            );

            const threshold = isLargeText(device)(target) ? 3 : 4.5;

            return expectation(
              highest >= threshold,
              () =>
                Outcomes.HasSufficientContrast(highest, threshold, pairings),
              () =>
                Outcomes.HasInsufficientContrast(highest, threshold, pairings)
            );
          })
        );

        const parent = target.parent({ flattened: true }).get() as Element;

        return {
          1: getForeground(parent, device)
            .map((foreground) => result.answer(foreground))
            .flatMap((result) =>
              getBackground(parent, device)
                .map((background) => result.answer(background))
                .orElse(() => Option.of(result))
            )
            .getOr(result),
        };
      },
    };
  },
});

/**
 * @see https://w3c.github.io/wcag/guidelines/#dfn-relative-luminance
 */
function luminance(color: RGB): number {
  const [red, green, blue] = [color.red, color.green, color.blue].map((c) => {
    const component = c.type === "number" ? c.value / 0xff : c.value;

    return component <= 0.03928
      ? component / 12.92
      : Math.pow((component + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * @see https://w3c.github.io/wcag/guidelines/#dfn-contrast-ratio
 */
function contrast(foreground: RGB, background: RGB): number {
  const lf = luminance(foreground);
  const lb = luminance(background);

  const contrast = (max(lf, lb) + 0.05) / (min(lf, lb) + 0.05);

  return round(contrast * 100) / 100;
}

/**
 * @see https://act-rules.github.io/glossary/#disabled-element
 */
const isSemanticallyDisabled: Predicate<Element> = or(
  Element.isDisabled,
  hasAttribute(
    and(Attribute.hasName("aria-disabled"), hasValue(equals("true")))
  )
);
