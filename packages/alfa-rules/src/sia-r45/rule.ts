import { Rule } from "@siteimprove/alfa-act";
import { Attribute, Element, Namespace } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectation";
import { hasAttribute } from "../common/predicate/has-attribute";
import { isPerceivable } from "../common/predicate/is-perceivable";

const { isElement, hasName, hasNamespace } = Element;
const { and, equals, not } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r45.html",
  evaluate({ device, document }) {
    // records in which <table> is located each "headers" attribute
    let ownership = Map.empty<Attribute, Element>();

    return {
      *applicability() {
        // get all perceivable tables in the document
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
          // get all cells with a headers attribute
          const cells = table
            .descendants()
            .filter(
              and(
                isElement,
                and(
                  hasNamespace(Namespace.HTML),
                  hasName("td", "th"),
                  hasAttribute("headers")
                )
              )
            );

          for (const cell of cells) {
            const header = cell.attribute("headers").get();
            ownership = ownership.set(header, table);
            yield header;
          }
        }
      },

      expectations(target) {
        const table = ownership.get(target).get();
        const idsList = target.tokens();
        const referredCells = table
          .resolveReferences(...idsList)
          .filter(
            and(
              isElement,
              and(hasNamespace(Namespace.HTML), hasName("td", "th"))
            )
          );

        return {
          1: expectation(
            // each token refers to a different cell in the same table iff both array have the same length.
            referredCells.length === idsList.length,
            () => Outcomes.HeadersRefersToCellInTable,
            () => Outcomes.HeadersDoesNotReferToCellsInTable
          ),
          2: expectation(
            referredCells.every((cell) => !target.owner.get().equals(cell)),
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
    "The headers attribute refers to cells in the same <table>."
  );

  export const HeadersDoesNotReferToCellsInTable = Err.of(
    "The headers attribute refers to cells not present in the same <table>."
  );

  export const HeadersDoesNotRefersToSelf = Ok.of(
    "The headers attribute does not refer to the cell defining it"
  );
  export const HeadersRefersToSelf = Err.of(
    "The headers attribute refers to the cell defining it"
  );
}
