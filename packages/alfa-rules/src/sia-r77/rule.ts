import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Table, Cell } from "@siteimprove/alfa-table";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole, isIgnored, isPerceivable } from "../common/predicate";

const { isElement, hasName, hasNamespace } = Element;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r77",
  requirements: [Criterion.of("1.3.1"), Technique.of("H43")],
  evaluate({ device, document }) {
    const data = new Map<Element, [cell: Cell, table: Table]>();

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
          if (model.cells.find((cell) => cell.isHeader()).isNone()) {
            continue;
          }

          const dataCells = table
            .descendants()
            .filter(isElement)
            .filter(
              and(
                hasNamespace(Namespace.HTML),
                hasName("td"),
                hasRole(device, "cell", "gridcell"),
                isPerceivable(device)
              )
            );
          for (const dataCell of dataCells) {
            for (const cell of model.cells.find((cell) =>
              cell.element.equals(cell)
            )) {
              data.set(dataCell, [cell, model]);

              yield dataCell;
            }
          }
        }
      },

      expectations(target) {
        const [dataCell] = data.get(target)!;

        return {
          1: expectation(
            dataCell.headers.isEmpty(),
            () => Outcomes.IsNotAssignedToHeaderCell,
            () => Outcomes.IsAssignedToHeaderCell
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsAssignedToHeaderCell = Ok.of(
    Diagnostic.of(`The cell is assigned to an header cell`)
  );

  export const IsNotAssignedToHeaderCell = Err.of(
    Diagnostic.of(`The cell is not assigned to any header cell`)
  );
}
