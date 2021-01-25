import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasOutline } from "../common/predicate/has-outline";
import { hasRole } from "../common/predicate/has-role";
import { hasTextDecoration } from "../common/predicate/has-text-decoration";
import { isVisible } from "../common/predicate/is-visible";

import { Question } from "../common/question";

const { isElement, hasName } = Element;
const { isText } = Text;
const { and, not, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r62.html",
  requirements: [Criterion.of("1.4.1")],
  evaluate({ device, document }) {
    return {
      applicability() {
        return visit(document, false);

        function* visit(node: Node, collect: boolean): Iterable<Element> {
          if (isElement(node)) {
            // If the element is a semantic link, it might be applicable.
            if (
              test(
                hasRole((role) => role.is("link")),
                node
              )
            ) {
              if (
                collect &&
                node
                  .descendants({ flattened: true })
                  .some(and(isText, isVisible(device)))
              ) {
                return yield node;
              }
            }

            // Otherwise, if the element is a <p> element with non-link text
            // content then start collecting applicable elements.
            else if (test(and(hasName("p"), hasNonLinkText(device)), node)) {
              collect = true;
            }
          }

          const children = node.children({
            flattened: true,
            nested: true,
          });

          for (const child of children) {
            yield* visit(child, collect);
          }
        }
      },

      expectations(target) {
        const container = target
          .ancestors({
            flattened: true,
          })
          .filter(isElement)
          .find(hasName("p"))
          .get();

        return {
          1: expectation(
            test(
              and(
                isDistinguishable(container, device),
                isDistinguishable(container, device, Context.hover(target)),
                isDistinguishable(container, device, Context.focus(target))
              ),
              target
            ),
            () => Outcomes.IsDistinguishable,
            () =>
              Question.of(
                "is-distinguishable",
                "boolean",
                target,
                `Can the link be distinguished from the surrounding text without
                relying on color perception alone?`
              ).map((isDistinguishable) =>
                Question.of(
                  "is-distinguishable-on-hover",
                  "boolean",
                  target,
                  `When hovered, can the link be distinguished from the
                  surrounding text without relying on color perception alone?`
                ).map((isDistinguishableOnHover) =>
                  Question.of(
                    "is-distinguishable-on-focus",
                    "boolean",
                    target,
                    `When focused, can the link be distinguished from the
                    surrounding text without relying on color perception alone?`
                  ).map((isDistinguishableOnFocus) =>
                    expectation(
                      isDistinguishable &&
                        isDistinguishableOnHover &&
                        isDistinguishableOnFocus,
                      () => Outcomes.IsDistinguishable,
                      () => Outcomes.IsNotDistinguishable
                    )
                  )
                )
              )
          ),

          2: expectation(
            test(
              and(
                isDistinguishable(container, device, Context.visit(target)),
                isDistinguishable(
                  container,
                  device,
                  Context.hover(target).visit(target)
                ),
                isDistinguishable(
                  container,
                  device,
                  Context.focus(target).visit(target)
                )
              ),
              target
            ),
            () => Outcomes.IsDistinguishableWhenVisited,
            () =>
              Question.of(
                "is-distinguishable-when-visited",
                "boolean",
                target,
                `When visited, can the link be distinguished from the
                surrounding text without relying on color perception alone?`
              ).map((isDistinguishableWhenVisited) =>
                Question.of(
                  "is-distinguishable-on-hover-when-visited",
                  "boolean",
                  target,
                  `When visited and hovered, can the link be distinguished
                  from the surrounding text without relying on color perception
                  alone?`
                ).map((isDistinguishableOnHoverWhenVisited) =>
                  Question.of(
                    "is-distinguishable-on-focus-when-visited",
                    "boolean",
                    target,
                    `When visited and focused, can the link be distinguished
                    from the surrounding text without relying on color
                    perception alone?`
                  ).map((isDistinguishableOnFocusWhenVisited) =>
                    expectation(
                      isDistinguishableWhenVisited &&
                        isDistinguishableOnHoverWhenVisited &&
                        isDistinguishableOnFocusWhenVisited,
                      () => Outcomes.IsDistinguishableWhenVisited,
                      () => Outcomes.IsNotDistinguishableWhenVisited
                    )
                  )
                )
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsDistinguishable = Ok.of(
    Diagnostic.of(`The link is distinguishable from the surrounding text`)
  );

  export const IsNotDistinguishable = Err.of(
    Diagnostic.of(
      `The link is not distinguishable from the surrounding text, either in its
      default state, or on hover and focus`
    )
  );

  export const IsDistinguishableWhenVisited = Ok.of(
    Diagnostic.of(
      `When visited, the link is distinguishable from the surrounding text`
    )
  );

  export const IsNotDistinguishableWhenVisited = Err.of(
    Diagnostic.of(
      `When visited, the link is not distinguishable from the surrounding text,
      either in its default state, or on hover and focus`
    )
  );
}

function hasNonLinkText(device: Device): Predicate<Element> {
  return function hasNonLinkText(element) {
    const children = element.children({
      flattened: true,
    });

    if (children.some(and(isText, isVisible(device)))) {
      return true;
    }

    return children
      .filter(isElement)
      .reject(hasRole((role) => role.is("link")))
      .some(hasNonLinkText);
  };
}

function isDistinguishable(
  container: Element,
  device: Device,
  context?: Context
): Predicate<Element> {
  return (element) => {
    if (
      test(not(hasOutline(device, context)), container) &&
      test(hasOutline(device, context), element)
    ) {
      return true;
    }

    if (
      test(not(hasTextDecoration(device, context)), container) &&
      test(hasTextDecoration(device, context), element)
    ) {
      return true;
    }

    return false;
  };
}
