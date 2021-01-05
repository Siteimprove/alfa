import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Document, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { URL } from "@siteimprove/alfa-url";
import { Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasChild } from "../common/predicate/has-child";
import { hasRole } from "../common/predicate/has-role";
import { isDocumentElement } from "../common/predicate/is-document-element";
import { isTabbable } from "../common/predicate/is-tabbable";
import { isIgnored } from "../common/predicate/is-ignored";
import { isKeyboardActionable } from "../common/predicate/is-keyboard-actionable";

import { Question } from "../common/question";

const { not, fold } = Predicate;
const { hasName, isElement } = Element;

export default Rule.Atomic.of<Page, Document, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r87.html",
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
        const element = target.tabOrder().find(isTabbable(device));

        const url = element
          .filter(hasName("a", "area"))
          .flatMap((element) =>
            element
              .attribute("href")
              .flatMap((attribute) =>
                URL.parse(attribute.value, response.url).ok()
              )
          );

        const reference = url
          .filter(isInternalURL(response.url))
          .flatMap((url) =>
            url.fragment.flatMap((fragment) =>
              element.flatMap((element) =>
                element
                  .root()
                  .inclusiveDescendants()
                  .filter(isElement)
                  .find((element) => element.id.includes(fragment))
              )
            )
          );

        const askIsMain = Question.of(
          "first-tabbable-reference-is-main",
          "boolean",
          target,
          `Does the first tabbable element of the document point to the main content?`
        );

        const askIsInteralLink = Question.of(
          "first-tabbable-is-internal-link",
          "boolean",
          target,
          `Is the first tabbable element of the document an internal link?`
        );

        const askReference = Question.of(
          "first-tabbable-reference",
          "node",
          document,
          `Where in the document does the first tabbable element point?`
        );

        return {
          1: expectation(
            element.isNone(),
            () => Outcomes.HasNoTabbable,
            () =>
              expectation(
                element.none(hasRole((role) => role.is("link"))),
                () => Outcomes.FirstTabbableIsNotLink,
                () =>
                  expectation(
                    element.none(not(isIgnored(device))),
                    () => Outcomes.FirstTabbableIsIgnored,
                    () =>
                      expectation(
                        element.none(isKeyboardActionable(device)),
                        () => Outcomes.FirstTabbableIsNotKeyboardActionable,
                        () =>
                          reference.isSome()
                            ? expectation(
                                reference.some(hasRole("main")),
                                () => Outcomes.FirstTabbableIsLinkToContent,
                                () =>
                                  askIsMain.map((isMain) =>
                                    expectation(
                                      isMain,
                                      () =>
                                        Outcomes.FirstTabbableIsLinkToContent,
                                      () =>
                                        Outcomes.FirstTabbableIsNotLinkToContent
                                    )
                                  )
                              )
                            : askIsInteralLink.map((isInternalLink) =>
                                expectation(
                                  !isInternalLink,
                                  () => Outcomes.FirstTabbableIsNotInternalLink,
                                  () =>
                                    askReference.map((reference) =>
                                      expectation(
                                        reference
                                          .filter(isElement)
                                          .some(hasRole("main")),
                                        () =>
                                          Outcomes.FirstTabbableIsLinkToContent,
                                        () =>
                                          askIsMain.map((isMain) =>
                                            expectation(
                                              isMain,
                                              () =>
                                                Outcomes.FirstTabbableIsLinkToContent,
                                              () =>
                                                Outcomes.FirstTabbableIsNotLinkToContent
                                            )
                                          )
                                      )
                                    )
                                )
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

  export const FirstTabbableIsNotKeyboardActionable = Err.of(
    Diagnostic.of(
      `The first tabbable element in the document is not keyboard actionable`
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
