import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Document, Element, Node } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";
import { URL } from "@siteimprove/alfa-url";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { Question } from "../common/act/question";

import { isAtTheStart } from "../common/predicate";

import { Scope, Stability, Version } from "../tags";

const { hasRole, isIgnored } = DOM;
const { hasName, isDocumentElement, isElement } = Element;
const { fold } = Predicate;
const { and } = Refinement;
const { isTabbable, isVisible } = Style;

/**
 * This version of R87 ask questions whose subject is not the target of the rule.
 * The context of the question is still the test target (the document), but the
 * subjects can be various elements (the first focusable element, or its
 * destination once it's been identified as a link).
 * This needs changes in Dory, Nemo, and likely databases to be stored;
 * this needs changes in the Page Report to be able to highlight an element
 * different from the test target.
 */
export default Rule.Atomic.of<Page, Document, Question.Metadata, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r87",
  requirements: [Technique.of("G1")],
  tags: [Scope.Page, Stability.Experimental, Version.of(2)],
  evaluate({ device, document, response }) {
    return {
      applicability() {
        return fold(
          Node.hasChild(isDocumentElement),
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

        // Is "reference" at the start of the main content?
        const isAtTheStartOfMain = (reference: Node) => {
          // Find the closest Element ancestor of the reference.
          const destination = reference
            .inclusiveAncestors(Node.fullTree)
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
          const isAtStart = document
            .inclusiveDescendants(Node.flatTree)
            .filter(and(isElement, hasRole(device, "main")))
            .some((main) => isAtTheStart(main, device)(reference));

          return askIsMain.answerIf(isAtStart, true).map((isMain) =>
            expectation(
              isMain,
              () => Outcomes.FirstTabbableIsLinkToContent,
              () => Outcomes.FirstTabbableIsNotLinkToContent
            )
          );
        };

        const askReference = Question.of("internal-reference", element, target);

        // The URL pointed by element.
        const url = hasName("a", "area")(element)
          ? element
              .attribute("href")
              .flatMap((attribute) =>
                URL.parse(attribute.value, response.url).ok()
              )
          : None;

        // The internal node (if any) this URL resolves to.
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

        // Is the first tabbable a link to main content?
        const isSkipLink = () =>
          askReference
            // If the reference was automatically found, send it.
            //
            // The question expects an Option<Node> answer, so we cannot
            // just .answerIf(reference) as this would only send a Node.
            .answerIf(reference.isSome(), reference)
            .map((ref) =>
              expectation<Question.Metadata, Element, Document, 0>(
                // Oracle may still answer None to the question.
                ref.isSome(),
                () => isAtTheStartOfMain(ref.get()),
                () => Outcomes.FirstTabbableIsNotInternalLink
              )
            );

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
                      expectation<Question.Metadata, Element, Document, 1>(
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
