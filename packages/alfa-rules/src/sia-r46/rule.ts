import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
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
  uri: "https://alfa.siteimprove.com/rules/sia-r46",
  requirements: [Criterion.of("1.3.1"), Technique.of("H43")],
  evaluate({ device, document }) {
    let data = Map.empty<Element, [cell: Cell, table: Table]>();

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
                hasRole(device, "rowheader", "columnheader"),
                isPerceivable(device)
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
        const [header, table] = data.get(target).get();

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

export namespace Outcomes {
  export const IsAssignedToDataCell = Ok.of(
    Diagnostic.of(`The header cell is assigned to a cell`)
  );

  export const IsNotAssignedToDataCell = Err.of(
    Diagnostic.of(`The header cell is not assigned to any cell`)
  );
}
