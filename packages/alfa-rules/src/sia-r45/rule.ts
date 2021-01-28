import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";

import { hasAttribute } from "../common/predicate/has-attribute";
import { hasRole } from "../common/predicate/has-role";
import { isPerceivable } from "../common/predicate/is-perceivable";

const { isElement, hasId, hasName, hasNamespace } = Element;
const { and, equals, not } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r45.html",
  requirements: [Criterion.of("1.3.1"), Technique.of("H43")],
  evaluate({ device, document }) {
    const headers = document
      .descendants()
      .filter(isElement)
      .filter(
        and(
          hasNamespace(Namespace.HTML),
          hasName("table"),
          isPerceivable(device),
          hasRole(not((role) => role.isPresentational()))
        )
      )
      .reduce((headers, table) => {
        const cells = table
          .descendants()
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("td", "th"),
              hasAttribute("headers")
            )
          );

        for (const cell of cells) {
          headers = headers.set(cell.attribute("headers").get(), table);
        }

        return headers;
      }, Map.empty<Attribute, Element>());

    return {
      applicability() {
        return headers.keys();
      },

      expectations(target) {
        const table = headers.get(target).get();

        const ids = target.tokens();

        const cells = table
          .descendants()
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML),
              hasName("td", "th"),
              hasId(equals(...ids))
            )
          );

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
