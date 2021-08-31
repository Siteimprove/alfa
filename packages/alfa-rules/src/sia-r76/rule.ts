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
    const data = new Map<Element, Cell>();

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
          const model = Table.from(table);

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
            for (const cell of model.cells.find((cell) =>
              cell.element.equals(header)
            )) {
              data.set(header, cell);

              yield header;
            }
          }
        }
      },
      expectations(target) {
        // header is yielded after storing cell in data.
        const cell = data.get(target)!;

        return {
          1:
            // We cannot use `expectation` because we need the narrowing
            // of cell to Cell.Header in the true branch.
            //
            // The scope attribute can be "auto" and resolve to an actual scope.
            // But cell.scope has been filled by Table > formTable > assignScope
            // and only defaults to "auto" if no actual scope is found.
            cell.isHeader() && cell.scope !== "auto"
              ? Outcomes.HasScope(cell.scope)
              : Outcomes.HasNoScope,

          2: expectation(
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
  export const HasScope = (scope: Scope) =>
    Ok.of(Diagnostic.of(`The header cell is a ${scope}`));

  export const HasNoScope = Err.of(
    Diagnostic.of(
      `The header cell is neither a \`column\`, \`column group\`,
      \`row\`, nor \`row group\` header`
    )
  );

  export const HasHeaderRole = Ok.of(
    Diagnostic.of(
      `The header element has either a \`columnheader\` or \`rowheader\` role`
    )
  );

  export const HasNoHeaderRole = Err.of(
    Diagnostic.of(
      `The header element has neither a \`columnheader\` nor a \`rowheader\` role`
    )
  );
}
