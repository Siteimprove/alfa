import { Rule } from "@siteimprove/alfa-act";
import {
  Element,
  hasName,
  isElementByName,
  Table,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectation";

import { hasRole } from "../common/predicate/has-role";
import { isPerceivable } from "../common/predicate/is-perceivable";

const { and, equals, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r46.html",
  // only working with HTML elements, not with roles.
  // Thus https://act-rules.github.io/rules/d0f69e/#passed-example-2 will be ignored.
  // Need to copy the table building algo for roles to handle it.
  // Is it worth it?
  evaluate({ device, document }) {
    // records in which <table> is located each <th>
    let ownership: Map<Element, Element> = Map.of();

    return {
      applicability() {
        return document
          .descendants()
          .filter(
            and(
              // The table model only works if the element is a th.
              and(
                isElementByName("th"),
                hasRole(hasName(equals("rowheader", "columnheader")))
              ),
              isPerceivable(device)
            )
          )
          .map((th) => {
            let result: Option<Element> = None;
            // get the table containing it: the first <table> ancestor
            const table = th.ancestors().find(isElementByName("table"));

            if (table.isNone()) return result;
            if (not(isPerceivable(device))(table.get())) return result;

            ownership = ownership.set(th, table.get());
            result = Some.of(th);
            return result;
          })
          .filter((option) => option.isSome())
          .map((option) => option.get());
      },

      expectations(target) {
        const tableModel = Table.from(ownership.get(target).get(), document);
        return {
          1: expectation(
            tableModel.isErr(),
            // could return a "can't tell" instead?
            () => Outcomes.TableHasError,
            () =>
              expectation(
                Iterable.some(
                  tableModel.get().cells,
                  (cell) =>
                    // does there exists a (grid)cell with the target as one of its headers?
                    hasRole(hasName(equals("cell", "gridcell")))(
                      cell.element
                    ) && Iterable.find(cell.headers, equals(target)).isSome()
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
    "The header cell is assigned to some data cell."
  );

  export const IsNotAssignedToDataCell = Err.of(
    "The header cell is not assigned to any data cell."
  );

  export const TableHasError = Err.of("The table has a table model error");
}
