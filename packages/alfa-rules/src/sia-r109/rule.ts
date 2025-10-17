import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import type { Document, Node } from "@siteimprove/alfa-dom";
import { Element } from "@siteimprove/alfa-dom";
import { EAA } from "@siteimprove/alfa-eaa";
import type { Hash } from "@siteimprove/alfa-hash";
import { Language } from "@siteimprove/alfa-iana";
import { Option } from "@siteimprove/alfa-option";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";
import { Question } from "../common/act/question.js";

import { Scope, Stability } from "../tags/index.js";
import { withDocumentElement } from "../common/applicability/with-document-element.js";

const { hasAttribute } = Element;

/**
 * This rule always asks for the language of the page, and compares it with
 * the `lang` attribute. This is not a nice experience for the end user and
 * shouldn't be used until backend can automatically determine the answer.
 */
export default Rule.Atomic.of<Page, Document, Question.Metadata>({
  uri: "https://alfa.siteimprove.com/rules/sia-r109",
  requirements: [Criterion.of("3.1.1"), EAA.of("9.3.1.1"), Technique.of("H57")],
  tags: [Scope.Page, Stability.Experimental],
  evaluate({ document }) {
    let programmaticLanguage: Language;

    return {
      applicability() {
        return withDocumentElement(
          document,
          hasAttribute("lang", (lang) =>
            Language.parse(lang)
              .tee((lang) => {
                programmaticLanguage = lang;
              })
              .isOk(),
          ),
        );
      },

      expectations(target) {
        return {
          1: Question.of("document-language", target).map((language) =>
            Language.parse(language).mapOrElse(
              (naturalLanguage) =>
                expectation(
                  programmaticLanguage.primary.equals(naturalLanguage.primary),
                  () =>
                    Outcomes.HasCorrectLang(
                      programmaticLanguage,
                      naturalLanguage,
                    ),
                  () =>
                    Outcomes.HasIncorrectLang(
                      programmaticLanguage,
                      naturalLanguage,
                    ),
                ),
              (_) => Option.of(Outcomes.HasNoLanguage(programmaticLanguage)),
            ),
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const HasCorrectLang = (programmatic: Language, natural: Language) =>
    Ok.of(
      Languages.of(
        `The document's \`lang\` attribute (${programmatic}) matches its language (${natural})`,
        programmatic,
        natural,
      ),
    );

  export const HasIncorrectLang = (programmatic: Language, natural: Language) =>
    Err.of(
      Languages.of(
        `The document's \`lang\` attribute (${programmatic}) does not match its language (${natural})`,
        programmatic,
        natural,
      ),
    );

  export const HasNoLanguage = (programmatic: Language) =>
    Err.of(
      Languages.of(
        "The document has no identifiable natural language",
        programmatic,
      ),
    );
}

/**
 * @public
 */
export class Languages extends Diagnostic {
  public static of(
    message: string,
    programmatic: Language = Language.of(Language.Primary.of("en")),
    natural?: Language,
  ) {
    return new Languages(message, programmatic, Option.from(natural));
  }

  private readonly _programmatic: Language;
  private readonly _natural: Option<Language>;

  protected constructor(
    message: string,
    programmatic: Language,
    natural: Option<Language>,
  ) {
    super(message);
    this._programmatic = programmatic;
    this._natural = natural;
  }

  public get programmatic(): Language {
    return this._programmatic;
  }

  public get natural(): Option<Language> {
    return this._natural;
  }

  public equals(value: Diagnostic): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Languages &&
      value._message === this._message &&
      value._programmatic.equals(this._programmatic) &&
      value._natural.equals(this._natural)
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    hash.writeString(this._programmatic.primary.name);
    this._natural.forEach((lang) => hash.writeString(lang.primary.name));
  }

  public toJSON(options?: Node.SerializationOptions): Languages.JSON {
    return {
      ...super.toJSON(options),
      programmatic: this._programmatic.toJSON(),
      natural: this._natural.toJSON(),
    };
  }
}

/**
 * @public
 */
export namespace Languages {
  export interface JSON extends Diagnostic.JSON {
    programmatic: Language.JSON;
    natural: Option.JSON<Language>;
  }

  export function isLanguages(value: Diagnostic): value is Languages;

  export function isLanguages(value: unknown): value is Languages;

  /**@public */
  export function isLanguages(value: unknown): value is Languages {
    return value instanceof Languages;
  }
}
