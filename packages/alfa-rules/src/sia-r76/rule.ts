import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Cell, Scope, Table } from "@siteimprove/alfa-table";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { hasRole, isIgnored, isPerceivable } from "../common/predicate";

const { isElement, hasName, hasNamespace } = Element;
const { and, not, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r76",
  requirements: [Criterion.of("1.3.1")],
  evaluate({ device, document }) {
    return {
      *applicability() {
        const tables = document
          .descendants()
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("table"),
              not(isIgnored(device))
            )
          );

        for (const table of tables) {
          const headers = table
            .descendants()
            .filter(isElement)
            .filter(
              and(
                hasNamespace(Namespace.HTML),
                hasName("th"),
                isPerceivable(device)
              )
            );

          for (const header of headers) {
            yield header;
          }
        }
      },
      expectations(target) {
        return {
          1: expectation(
            test(hasRole(device, "columnheader", "rowheader"), target),
            () => Outcomes.HasHeaderRole,
            () => Outcomes.HasNoHeaderRole
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasHeaderRole = Ok.of(
    Diagnostic.of(`The header element is a semantic header`)
  );

  export const HasNoHeaderRole = Err.of(
    Diagnostic.of(`The header element is not a semantic header`)
  );
}
