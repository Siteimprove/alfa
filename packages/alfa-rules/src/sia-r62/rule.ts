import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isVisible } from "../common/predicate/is-visible";

import { Question } from "../common/question";

const { isElement, hasName } = Element;
const { isText } = Text;
const { and, or, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r62.html",
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
              or(
                isDistinguishable(container, device),
                and(
                  isDistinguishable(container, device, Context.hover(target)),
                  isDistinguishable(container, device, Context.focus(target))
                )
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
                expectation(
                  isDistinguishable,
                  () => Outcomes.IsDistinguishable,
                  () =>
                    Question.of(
                      "is-distinguishable-on-hover",
                      "boolean",
                      target,
                      `When hovered, can the link be distinguished from the
                      surrounding text without relying on color perception
                      alone?`
                    ).map((isDistinguishableOnHover) =>
                      expectation(
                        isDistinguishableOnHover,
                        () =>
                          Question.of(
                            "is-distinguishable-on-focus",
                            "boolean",
                            target,
                            `When focused, can the link be distinguished from
                            the surrounding text without relying on color
                            perception alone?`
                          ).map((isDistinguishableOnFocus) =>
                            expectation(
                              isDistinguishableOnFocus,
                              () => Outcomes.IsDistinguishable,
                              () => Outcomes.IsNotDistinguishable
                            )
                          ),
                        () => Outcomes.IsNotDistinguishable
                      )
                    )
                )
              )
          ),

          2: expectation(
            test(
              or(
                isDistinguishable(container, device, Context.visit(target)),
                and(
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
              ).map((isDistinguishable) =>
                expectation(
                  isDistinguishable,
                  () => Outcomes.IsDistinguishableWhenVisited,
                  () =>
                    Question.of(
                      "is-distinguishable-on-hover-when-visited",
                      "boolean",
                      target,
                      `When visited and hovered, can the link be distinguished
                      from the surrounding text without relying on color
                      perception alone?`
                    ).map((isDistinguishableOnHoverWhenVisited) =>
                      expectation(
                        isDistinguishableOnHoverWhenVisited,
                        () =>
                          Question.of(
                            "is-distinguishable-on-focus-when-visited",
                            "boolean",
                            target,
                            `When visited and focused, can the link be
                            distinguished from the surrounding text without
                            relying on color perception alone?`
                          ).map((isDistinguishableOnFocusWhenVisited) =>
                            expectation(
                              isDistinguishableOnFocusWhenVisited,
                              () => Outcomes.IsDistinguishableWhenVisited,
                              () => Outcomes.IsNotDistinguishableWhenVisited
                            )
                          ),
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
  const surroundings = Style.from(container, device, context);

  return (element) => {
    const style = Style.from(element, device, context);

    for (const property of [
      "text-decoration-line",
      "text-decoration-style",
    ] as const) {
      if (!style.computed(property).equals(surroundings.computed(property))) {
        return true;
      }
    }

    return false;
  };
}
