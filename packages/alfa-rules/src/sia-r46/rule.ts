import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Table } from "@siteimprove/alfa-table";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isPerceivable } from "../common/predicate/is-perceivable";

const { isElement, hasName, hasNamespace } = Element;
const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r46.html",
  evaluate({ device, document }) {
    let ownership = Map.empty<Element, Element>();

    return {
      *applicability() {
        const tables = document
          .descendants()
          .filter(
            and(
              isElement,
              and(
                hasNamespace(Namespace.HTML),
                hasName("table"),
                isPerceivable(device)
              )
            )
          );

        for (const table of tables) {
          const headerCells = table.descendants().filter(
            and(
              isElement,
              and(
                hasNamespace(Namespace.HTML),
                // The table model only works if the element is a th.
                hasName("th"),
                hasRole("rowheader", "columnheader"),
                isPerceivable(device)
              )
            )
          );

          for (const cell of headerCells) {
            ownership = ownership.set(cell, table);
            yield cell;
          }
        }
      },

      expectations(target) {
        const tableModel = Table.from(ownership.get(target).get());
        return {
          1: expectation(
            tableModel.isErr(),
            () => Outcomes.TableHasError,
            () =>
              expectation(
                Iterable.some(
                  tableModel.get().cells,
                  (cell) =>
                    // Does there exists a cell with the target as one of its headers?
                    hasRole("cell", "gridcell")(cell.element) &&
                    Iterable.some(cell.headers, equals(target))
                ),
                () => Outcomes.IsAssignedToDataCell,
                () => Outcomes.IsNotAssignedToDataCell
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsAssignedToDataCell = Ok.of(
    Diagnostic.of(`The header cell is assigned to a data cell`)
  );

  export const IsNotAssignedToDataCell = Err.of(
    Diagnostic.of(`The header cell is not assigned to any data cell`)
  );

  export const TableHasError = Err.of(
    Diagnostic.of(`The table could not be formed correctly`)
  );
}
