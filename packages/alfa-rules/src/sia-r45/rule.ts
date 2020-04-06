import { Rule } from "@siteimprove/alfa-act";
import {
  Attribute,
  Element,
  isElementByName,
  resolveReferences,
} from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { parseTokensList } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { expectation } from "../common/expectation";
import { hasAttribute } from "../common/predicate/has-attribute";
import { isIgnored } from "../common/predicate/is-ignored";
import { isVisible } from "../common/predicate/is-visible";

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
            // get all <table>
            .filter(
              and(
                isElementByName("table"),
                and(isVisible(device), not(isIgnored(device)))
              )
            )
            // find all cells with headers, record the ownership in the map and return the headers attribute
            .flatMap((table) =>
              table
                .descendants()
                .filter(
                  and(isElementByName("th", "td"), hasAttribute("headers"))
                )
                .map((cell) => cell.attribute("headers").get())
                .map((headers) => {
                  ownership = ownership.set(headers, table);
                  return headers;
                })
            )
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
