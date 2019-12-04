import { Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { hasAccessibleName } from "../common/predicate/has-accessible-name";
import { hasNamespace } from "../common/predicate/has-namespace";
import { hasInputType } from "../common/predicate/has-input-type";
import { hasName } from "../common/predicate/has-name";
import { isIgnored } from "../common/predicate/is-ignored";

import { Question } from "../common/question";

const { filter } = Iterable;
const { and, or, not, equals, test } = Predicate;

export default Rule.Atomic.of<Page, Element, Question>({
  uri: "ttps://siteimprove.github.io/sanshikan/rules/sia-r39.html",
  evaluate({ device, document }) {
    return {
      applicability() {
        return filter(
          document.descendants({ flattened: true, nested: true }),
          and(
            Element.isElement,
            and(
              hasNamespace(equals(Namespace.HTML)),
              and(
                or(
                  hasName(equals("img")),
                  and(hasName(equals("input")), hasInputType(equals("image")))
                ),
                and(not(isIgnored(device)), element =>
                  test(
                    hasAccessibleName(device, accessibleName =>
                      element
                        .attribute("src")
                        .map(attr => getFilename(attr.value))
                        .some(
                          filename =>
                            filename === accessibleName.toLowerCase().trim()
                        )
                    ),
                    element
                  )
                )
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
            `Does the accessible name of the <${target.name}> element describe its purpose?`
          )
            ? Ok.of(
                `The accessible name of the <${target.name}> element describes its purpose`
              )
            : Err.of(
                `The accessible name of the <${target.name}> element does not describe its purpose`
              )
        };
      }
    };
  }
});

function getFilename(path: string): string {
  const base = path.substring(path.lastIndexOf("/") + 1);
  const params = base.indexOf("?");

  if (params !== -1) {
    return base.substring(0, params).trim();
  }

  return base.trim();
}
