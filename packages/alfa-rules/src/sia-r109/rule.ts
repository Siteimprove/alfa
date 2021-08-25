import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Document } from "@siteimprove/alfa-dom";
import { Language } from "@siteimprove/alfa-iana";
import { Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { hasAttribute, hasChild, isDocumentElement } from "../common/predicate";
import { Question } from "../common/question";

const { fold } = Predicate;
const { and } = Refinement;

export default Rule.Atomic.of<Page, Document, Question>({
  uri: "https://alfa.siteimprove.com/rules/sia-r109",
  requirements: [Criterion.of("3.1.1"), Technique.of("H57")],
  evaluate({ device, document }) {
    let programmaticLanguage: Language;

    return {
      applicability() {
        return fold(
          hasChild(
            and(
              isDocumentElement,
              hasAttribute("lang", (lang) =>
                Language.parse(lang)
                  .map((lang) => {
                    programmaticLanguage = lang;
                    return lang;
                  })
                  .isOk()
              )
            )
          ),
          () => [document],
          () => [],
          document
        );
      },

      expectations(target) {
        return {
          1: Question.of(
            "string",
            "document-language",
            "What is the main language of the document (IANA code)",
            target
          ).map((language) =>
            Language.parse(language).mapOrElse(
              (naturalLanguage) =>
                expectation(
                  programmaticLanguage.primary.equals(naturalLanguage.primary),
                  () =>
                    Outcomes.hasCorrectLang(
                      naturalLanguage,
                      programmaticLanguage
                    ),
                  () =>
                    Outcomes.hasIncorrectLang(
                      naturalLanguage,
                      programmaticLanguage
                    )
                ),
              (_) => Option.of(Outcomes.hasNoLanguage)
            )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const hasCorrectLang = (natural: Language, programmatic: Language) =>
    Ok.of(
      Diagnostic.of(
        `The document's \`lang\` attribute (${programmatic} matches its language (${natural}`
      )
    );

  export const hasIncorrectLang = (natural: Language, programmatic: Language) =>
    Err.of(
      Diagnostic.of(
        `The document's \`lang\` attribute (${programmatic}) does not match its language (${natural})`
      )
    );

  export const hasNoLanguage = Err.of(
    Diagnostic.of("The document has no identifiable natural language")
  );
}
