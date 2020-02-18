import {Predicate} from "@siteimprove/alfa-predicate";
import {Iterable} from "@siteimprove/alfa-iterable";
import {Element} from "..";

// https://html.spec.whatwg.org/multipage/tables.html#table-processing-model

export type Slot = { x: number; y: number; elements: Iterable<Element> };
type Table = Array<Array<Slot>>;

// https://html.spec.whatwg.org/multipage/tables.html#concept-cell
export type Cell = {
  kind: "data" | "header";
  // "top left" corner of the cell
  anchor: { x: number; y: number };
  // size of the cell
  width: number;
  height: number;
}

// https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
export type RowGroup = {
  // First row of the group
  anchor: { y: number };
  height: number;
}

// https://html.spec.whatwg.org/multipage/tables.html#concept-column-group
export type ColGroup = {
  // First column of the group
  anchor: { x: number };
  width: number;
}

export const isCoveredBy: Predicate<Slot, Slot, Array<Cell | RowGroup | ColGroup>> = (slot, cover) => {
  if ("width" in cover) { // Cell or Col
    if (slot.x < cover.anchor.x) { // slot is left of cover
      return false;
    }
    if (cover.anchor.x + cover.width - 1 < slot.x) { // slot is right of cover
      return false;
    }
  }

  if ("height" in cover) { // Cell or Row
    if (slot.y < cover.anchor.y) { // slot is above cover
      return false;
    }
    if (cover.anchor.y + cover.height - 1 < slot.y) { // slot is below cover
      return false;
    }
  }

  return true;
};
