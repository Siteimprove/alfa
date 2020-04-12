import { Rule } from "@siteimprove/alfa-act";
import {
  Attribute,
  Element,
  isElementByName,
  resolveReferences,
} from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { parseTokensList } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectation";
import { hasAttribute } from "../common/predicate/has-attribute";
import { isPerceivable } from "../common/predicate/is-perceivable";

const { parseAttribute } = Attribute;
const { and, not } = Predicate;

export default Rule.Atomic.of<Page, Attribute>({
  uri: "https://siteimprove.github.io/sanshikan/rules/sia-r45.html",
  evaluate({ device, document }) {
    // records in which <table> is located each "headers" attribute
    let ownership: Map<Attribute, Element> = Map.of();

    return {
      applicability() {
        return (
          document
            .descendants()
            // get all cells with a headers attribute
            .filter(and(isElementByName("td", "th"), hasAttribute("headers")))
            // get the attributes themselves
            .map((cell) => {
              let result: Option<Attribute> = None;
              // get the table containing it: the first <table> ancestor
              const table = cell.ancestors().find(isElementByName("table"));

              if (table.isNone()) return result;
              if (not(isPerceivable(device))(table.get())) return result;

              // if the table is exposed, record the ownership and return the headers attribute
              const headers = cell.attribute("headers").get();
              ownership = ownership.set(headers, table.get());
              result = Some.of(headers);
              return result;
            })
            .filter((option) => option.isSome())
            .map((option) => option.get())
        );
      },

      expectations(target) {
        const table = ownership.get(target).get();
        const idsList = parseAttribute(parseTokensList)(target).get();
        const referredCells = resolveReferences(table, ...idsList).filter(
          isElementByName("td", "th")
        );

        return {
          1: expectation(
            // if each token refers to a cell in the same table then both array have the same length.
            referredCells.length === idsList.length,
            () => Outcomes.HeadersRefersToCellInTable,
            () => Outcomes.HeadersDoesNotReferToCellsInTable
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
}
