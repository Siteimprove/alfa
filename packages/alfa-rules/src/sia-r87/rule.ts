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

import { hasChild } from "../common/predicate/has-child";
import { hasRole } from "../common/predicate/has-role";
import { isDocumentElement } from "../common/predicate/is-document-element";
import { isTabbable } from "../common/predicate/is-tabbable";
import { isIgnored } from "../common/predicate/is-ignored";
import { isVisible } from "../common/predicate/is-visible";

import { Question } from "../common/question";
import { isAtTheStart } from "../common/predicate/is-at-the-start";

const { hasName, isElement } = Element;
const { fold } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Document, Question>({
  uri: "https://alfa.siteimprove.com/rules/sia-r87",
  requirements: [Technique.of("G1")],
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

        // there can be more than one element with a role of main, going to any of these is OK.
        const mains = document
          .inclusiveDescendants({ flattened: true })
          .filter(and(isElement, hasRole(device, "main")));

        const askIsMain = Question.of(
          "boolean",
          "first-tabbable-reference-is-main",
          `Does the first tabbable element of the document point to the main content?`,
          target
        );

        const askIsInteralLink = Question.of(
          "boolean",
          "first-tabbable-is-internal-link",
          `Is the first tabbable element of the document an internal link?`,
          target
        );

        const askReference = Question.of(
          "node",
          "first-tabbable-reference",
          `Where in the document does the first tabbable element point?`,
          target
        );

        const askIsVisible = Question.of(
          "boolean",
          "first-tabbable-is-visible",
          `Is the first tabbable element of the document visible if it's focused?`,
          target
        );

        function isAtTheStartOfMain(
          reference: Option<Node>
        ): Interview<
          Question,
          Document,
          Document,
          Option.Maybe<Result<Diagnostic, Diagnostic>>
        > {
          return expectation(
            mains.some((main) => reference.some(isAtTheStart(main, device))),
            () => Outcomes.FirstTabbableIsLinkToContent,
            () =>
              askIsMain.map((isMain) =>
                expectation(
                  isMain,
                  () => Outcomes.FirstTabbableIsLinkToContent,
                  () => Outcomes.FirstTabbableIsNotLinkToContent
                )
              )
          );
        }

        function isSkipLink(): Interview<
          Question,
          Document,
          Document,
          Option.Maybe<Result<Diagnostic>>
        > {
          return reference.isSome()
            ? isAtTheStartOfMain(reference)
            : askIsInteralLink.map((isInternalLink) =>
                expectation(
                  isInternalLink,
                  () => askReference.map(isAtTheStartOfMain),
                  () => Outcomes.FirstTabbableIsNotInternalLink
                )
              );
        }

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
