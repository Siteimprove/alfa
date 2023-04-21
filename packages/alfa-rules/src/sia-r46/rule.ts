import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Cell, Table } from "@siteimprove/alfa-table";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasRole, isIncludedInTheAccessibilityTree, isPerceivableForAll } = DOM;
const { hasName, hasNamespace } = Element;
const { and } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r46",
  requirements: [Criterion.of("1.3.1"), Technique.of("H43")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    let data = Map.empty<Element, [cell: Cell, table: Table]>();

    return {
      *applicability() {
        const tables = document
          .elementDescendants()
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("table"),
              isIncludedInTheAccessibilityTree(device)
            )
          );

        for (const table of tables) {
          const model = Table.from(table);

          const headers = table
            .elementDescendants()
            .filter(
              and(
                hasNamespace(Namespace.HTML),
                hasName("th"),
                hasRole(device, "rowheader", "columnheader"),
                isPerceivableForAll(device)
              )
            );

          for (const header of headers) {
            for (const cell of model.cells.find((cell) =>
              cell.element.equals(header)
            )) {
              data = data.set(header, [cell, model]);

              yield header;
            }
          }
        }
      },

      expectations(target) {
        // data has been set just before yielding targets
        const [header, table] = data.get(target).getUnsafe();

        return {
          1: expectation(
            table.cells.some(
              (cell) =>
                // Does there exists a cell with the target as one of its headers?
                hasRole(device, (role) => role.is("cell"))(cell.element) &&
                cell.headers.some((slot) => slot.equals(header.anchor))
            ),
            () => Outcomes.IsAssignedToDataCell,
            () => Outcomes.IsNotAssignedToDataCell
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
  export const IsAssignedToDataCell = Ok.of(
    Diagnostic.of(`The header cell is assigned to a cell`)
  );

  export const IsNotAssignedToDataCell = Err.of(
    Diagnostic.of(`The header cell is not assigned to any cell`)
  );
}
