import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence/src/sequence";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { hasRole, isPerceivableForAll } = DOM;
const { hasAttribute, hasId, hasName, hasNamespace, isElement } = Element;
const { and, equals } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://alfa.siteimprove.com/rules/sia-r45",
  requirements: [Criterion.of("1.3.1"), Technique.of("H43")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    const cellsCache = Cache.empty<Element, Sequence<Element>>();

    const headers = document
      .elementDescendants()
      .filter(
        and(
          hasNamespace(Namespace.HTML),
          hasName("table"),
          isPerceivableForAll(device),
          hasRole(device, (role) => role.is("table"))
        )
      )
      .reduce((headers, table) => {
        const cells = cellsCache
          .get(table, () =>
            table
              .elementDescendants()
              .filter(and(hasNamespace(Namespace.HTML), hasName("td", "th")))
          )
          .filter(hasAttribute("headers"));
        for (const cell of cells) {
          // The previous filter ensures that headers exists.
          headers = headers.set(cell.attribute("headers").getUnsafe(), table);
        }

        return headers;
      }, Map.empty<Attribute, Element>());

    return {
      applicability() {
        return headers.keys();
      },

      expectations(target) {
        // targets are headers' key, so there is something in the map.
        const table = headers.get(target).getUnsafe();

        const ids = target.tokens();

        const cells = cellsCache
          .get(table, () =>
            table
              .elementDescendants()
              .filter(and(hasNamespace(Namespace.HTML), hasName("td", "th")))
          )
          .filter(hasId(equals(...ids)));

        return {
          1: expectation(
            // Each token refers to a different cell in the same table if the
            // number of identified cells is equal to the number of IDs.
            cells.size === ids.size,
            () => Outcomes.HeadersRefersToCellInTable,
            () => Outcomes.HeadersDoesNotReferToCellsInTable
          ),
          2: expectation(
            cells.every((cell) => !target.owner.some(equals(cell))),
            () => Outcomes.HeadersDoesNotRefersToSelf,
            () => Outcomes.HeadersRefersToSelf
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HeadersRefersToCellInTable = Ok.of(
    Diagnostic.of(
      `The \`headers\` attribute refers to cells in the same \`<table>\``
    )
  );

  export const HeadersDoesNotReferToCellsInTable = Err.of(
    Diagnostic.of(
      `The \`headers\` attribute refers to cells not present in the same \`<table>\``
    )
  );

  export const HeadersDoesNotRefersToSelf = Ok.of(
    Diagnostic.of(
      `The \`headers\` attribute does not refer to the cell defining it`
    )
  );

  export const HeadersRefersToSelf = Err.of(
    Diagnostic.of(`The \`headers\` attribute refers to the cell defining it`)
  );
}
