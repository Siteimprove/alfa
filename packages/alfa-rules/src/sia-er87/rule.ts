import { Interview, Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Document, Element, Node } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { URL } from "@siteimprove/alfa-url";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import {
  hasChild,
  hasRole,
  isAtTheStart,
  isDocumentElement,
  isTabbable,
  isIgnored,
  isVisible,
} from "../common/predicate";
import { Question } from "../common/question";
import { Scope, Stability } from "../tags";

const { hasName, isElement } = Element;
const { fold } = Predicate;
const { and } = Refinement;

/**
 * This version of R87 ask questions whose subject is not the target of the rule.
 * The context of the question is still the test target (the document), but the
 * subjects can be various elements (the first focusable element, or its
 * destination once it's been identified as a link).
 * This needs changes in Dory, Nemo, and likely databases to be stored;
 * this needs changes in the Page Report to be able to highlight an element
 * different from the test target.
 */
export default Rule.Atomic.of<Page, Document, Question.Type, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r87#experimental",
  requirements: [Technique.of("G1")],
  tags: [Scope.Page, Stability.Experimental],
  evaluate({ device, document, response }) {
    return {
      applicability() {
        return fold(
          hasChild(isDocumentElement),
          () => [document],
          () => [],
          document
        );
      },

      expectations(target) {
        const firstTabbable = target.tabOrder().find(isTabbable(device));

        if (firstTabbable.isNone()) {
          return { 1: Outcomes.HasNoTabbable };
        }

        const element = firstTabbable.get();

        function isAtTheStartOfMain(
          reference: Node
        ): Interview<
          Question.Type,
          Element,
          Document,
          Option.Maybe<Result<Diagnostic, Diagnostic>>
        > {
          // Find the closest Element ancestor of the reference.
          const destination = reference
            .inclusiveAncestors({ flattened: true, nested: true })
            .find(isElement);

          if (destination.isNone()) {
            return Outcomes.FirstTabbableIsNotLinkToContent;
          }

          const askIsMain = Question.of(
            "is-start-of-main",
            destination.get(),
            target
          );

          // there can be more than one element with a role of main, going to any of these is OK.
          const isAtSTart = document
            .inclusiveDescendants({ flattened: true })
            .filter(and(isElement, hasRole(device, "main")))
            .some((main) => isAtTheStart(main, device)(reference));

          return askIsMain.answerIf(isAtSTart, true).map((isMain) =>
            expectation(
              isMain,
              () => Outcomes.FirstTabbableIsLinkToContent,
              () => Outcomes.FirstTabbableIsNotLinkToContent
            )
          );
        }

        function isSkipLink(): Interview<
          Question.Type,
          Element,
          Document,
          Option.Maybe<Result<Diagnostic>>
        > {
          const askReference = Question.of(
            "internal-reference",
            element,
            target
          );

          const url = hasName("a", "area")(element)
            ? element
                .attribute("href")
                .flatMap((attribute) =>
                  URL.parse(attribute.value, response.url).ok()
                )
            : None;

          const reference = url
            .filter(isInternalURL(response.url))
            .flatMap((url) =>
              url.fragment.flatMap((fragment) =>
                element
                  .root()
                  .inclusiveDescendants()
                  .filter(isElement)
                  .find((element) => element.id.includes(fragment))
              )
            );

          return (
            askReference
              // If the reference was automatically found, send it.
              .answerIf(reference.isSome(), reference)
              .map((ref) =>
                expectation(
                  // Oracle may still answer None to the question.
                  ref.isSome(),
                  () => isAtTheStartOfMain(ref.get()),
                  () => Outcomes.FirstTabbableIsNotInternalLink
                )
              )
          );
        }

        const askIsVisible = Question.of(
          "is-visible-when-focused",
          element,
          target
        );

        return {
          1: expectation(
            isIgnored(device)(element),
            () => Outcomes.FirstTabbableIsIgnored,
            () =>
              expectation(
                hasRole(device, (role) => role.is("link"))(element),
                () =>
                  // No need to check if element is tabbable because this was
                  // already checked at the very start of expectation.
                  askIsVisible
                    .answerIf(
                      isVisible(device, Context.focus(element))(element),
                      true
                    )
                    .map((isVisible) =>
                      expectation(
                        isVisible,
                        isSkipLink,
                        () => Outcomes.FirstTabbableIsNotVisible
                      )
                    ),
                () => Outcomes.FirstTabbableIsNotLink
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasNoTabbable = Err.of(
    Diagnostic.of(`The document has no tabbable descendants`)
  );

  export const FirstTabbableIsNotLink = Err.of(
    Diagnostic.of(
      `The first tabbable element in the document is not a semantic link`
    )
  );

  export const FirstTabbableIsNotInternalLink = Err.of(
    Diagnostic.of(
      `The first tabbable element in the document is not an internal link`
    )
  );

  export const FirstTabbableIsIgnored = Err.of(
    Diagnostic.of(
      `The first tabbable element in the document is not included in the
      accessibility tree`
    )
  );

  export const FirstTabbableIsNotVisible = Err.of(
    Diagnostic.of(
      `The first tabbable element in the document is not visible when on focus`
    )
  );

  export const FirstTabbableIsLinkToContent = Ok.of(
    Diagnostic.of(
      `The first tabbable element in the document is a keyboard actionable link
      that is included in the accessibility tree and links to the main block of
      content of the document`
    )
  );

  export const FirstTabbableIsNotLinkToContent = Err.of(
    Diagnostic.of(
      `The first tabbable element in the document is a keyboard actionable link
      that is included in the accessibility tree, but does not link to the main
      block of content of the document`
    )
  );
}

function isInternalURL(base: URL): Predicate<URL> {
  return (url) =>
    url.fragment.isSome() &&
    url.withoutFragment().equals(base.withoutFragment());
}
