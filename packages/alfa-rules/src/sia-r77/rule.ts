import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Query } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Cell, Table } from "@siteimprove/alfa-table";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasRole, isIncludedInTheAccessibilityTree, isPerceivableForAll } = DOM;
const { hasName, hasNamespace } = Element;
const { and } = Predicate;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r77",
  requirements: [Criterion.of("1.3.1")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    let data = Map.empty<Element, Cell>();

    return {
      *applicability() {
        const tables = getElementDescendants(document).filter(
          and(
            hasNamespace(Namespace.HTML),
            hasName("table"),
            isIncludedInTheAccessibilityTree(device),
          ),
        );

        for (const table of tables) {
          const model = Table.from(table);

          if (model.cells.find((cell) => cell.isHeader()).isNone()) {
            continue;
          }

          const dataCells = getElementDescendants(table).filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("td"),
              hasRole(device, "cell", "gridcell"),
              isPerceivableForAll(device),
            ),
          );

          for (const dataCell of dataCells) {
            for (const cell of model.cells.find((cell) =>
              cell.element.equals(dataCell),
            )) {
              data = data.set(dataCell, cell);

              yield dataCell;
            }
          }
        }
      },

      expectations(target) {
        // targets are yielded after filling the map.
        const cell = data.get(target).getUnsafe();

        return {
          1: expectation(
            cell.headers.isEmpty(),
            () => Outcomes.IsNotAssignedToHeaderCell,
            () => Outcomes.IsAssignedToHeaderCell,
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
  export const IsAssignedToHeaderCell = Ok.of(
    Diagnostic.of(`The cell is assigned to an header cell`),
  );

  export const IsNotAssignedToHeaderCell = Err.of(
    Diagnostic.of(`The cell is not assigned to any header cell`),
  );
}
