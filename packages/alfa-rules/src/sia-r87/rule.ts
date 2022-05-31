import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Document, Element, Node } from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";
import { URL } from "@siteimprove/alfa-url";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { isAtTheStart } from "../common/predicate";

import { Question } from "../common/act/question";
import { Scope } from "../tags";

const { hasRole, isIgnored } = DOM;
const { hasName, isDocumentElement, isElement } = Element;
const { fold } = Predicate;
const { and } = Refinement;
const { isTabbable, isVisible } = Style;

export default Rule.Atomic.of<Page, Document, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r87",
  requirements: [Technique.of("G1")],
  tags: [Scope.Page],
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
          .inclusiveDescendants(Node.flatTree)
          .filter(and(isElement, hasRole(device, "main")));

        const askIsMain = Question.of(
          "first-tabbable-reference-is-main",
          target
        );

        const askIsInternalLink = Question.of(
          "first-tabbable-is-internal-link",
          target
        );

        const askReference = Question.of("first-tabbable-reference", target);

        const isAtTheStartOfMain = (reference: Option<Node>) =>
          expectation<Question.Metadata, Document, Document, 0>(
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

        const isSkipLink = () =>
          reference.isSome()
            ? isAtTheStartOfMain(reference)
            : askIsInternalLink.map((isInternalLink) =>
                expectation<Question.Metadata, Document, Document, 1>(
                  isInternalLink,
                  () => askReference.map(isAtTheStartOfMain),
                  () => Outcomes.FirstTabbableIsNotInternalLink
                )
              );

        // No need to check if element is tabbable because this was
        // already checked at the very start of expectation.
        const askIsVisible = () =>
          Question.of("first-tabbable-is-visible", target)
            .answerIf(isVisible(device, Context.focus(element))(element), true)
            .map((isVisible) =>
              expectation<Question.Metadata, Document, Document, 2>(
                isVisible,
                isSkipLink,
                () => Outcomes.FirstTabbableIsNotVisible
              )
            );

        return {
          1: expectation(
            isIgnored(device)(element),
            () => Outcomes.FirstTabbableIsIgnored,
            () =>
              expectation(
                hasRole(device, (role) => role.is("link"))(element),
                askIsVisible,
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
