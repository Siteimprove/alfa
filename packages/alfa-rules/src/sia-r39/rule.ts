import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasInputType } from "../common/predicate/has-input-type";
import { isIgnored } from "../common/predicate/is-ignored";

import { Question } from "../common/question";

const { isElement, hasName, hasNamespace } = Element;
const { and, or, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r39.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return document.descendants({ flattened: true, nested: true }).filter(
          and(
            isElement,
            and(
              hasNamespace(Namespace.HTML),
              or(
                hasName("img"),
                and(hasName("input"), hasInputType(equals("image")))
              ),
              not(isIgnored(device)),
              (element) =>
                test(
                  hasAccessibleName(device, (accessibleName) =>
                    element
                      .attribute("src")
                      .map((attr) => getFilename(attr.value))
                      .some(
                        (filename) =>
                          filename === accessibleName.toLowerCase().trim()
                      )
                  ),
                  element
                )
            )
          )
        );
      },

      expectations(target) {
        return {
          1: Question.of(
            "name-describes-purpose",
            "boolean",
            target,
            `Does the accessible name of the \`<${target.name}>\` element
            describe its purpose?`
          ).map((nameDescribesPurpose) =>
            expectation(
              nameDescribesPurpose,
              () => Outcomes.NameIsDescriptive(target.name),
              () => Outcomes.NameIsNotDescriptive(target.name)
            )
          ),
        };
      },
    };
  },
});

function getFilename(path: string): string {
  const base = path.substring(path.lastIndexOf("/") + 1);
  const params = base.indexOf("?");

  if (params !== -1) {
    return base.substring(0, params).trim();
  }

  return base.trim();
}

export namespace Outcomes {
  export const NameIsDescriptive = (name: string) =>
    Ok.of(
      Diagnostic.of(
        `The accessible name of the \`<${name}>\` element describes its purpose`
      )
    );

  export const NameIsNotDescriptive = (name: string) =>
    Err.of(
      Diagnostic.of(
        `The accessible name of the \`<${name}>\` element does not describe its purpose`
      )
    );
}
