import {Predicate} from "@siteimprove/alfa-predicate";
import {Iterable} from "@siteimprove/alfa-iterable";
import {Element} from "..";

// https://html.spec.whatwg.org/multipage/tables.html#table-processing-model

type Slot = { x: number; y: number; elements: Iterable<Element>};
type Table = Array<Array<Slot>>;

// https://html.spec.whatwg.org/multipage/tables.html#concept-cell
type Cell = {
  kind: "data" | "header";
  // "top left" corner of the cell
  anchor: Slot;
  // size of the cell
  width: number;
  height: number;
}

// https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
type RowGroup = {
  anchor: {y: number};
  height: number;
}

// https://html.spec.whatwg.org/multipage/tables.html#concept-column-group
type ColGroup = {
  anchor: {x: number};
  width: number;
}

const isCoveredBy: Predicate<Slot, Slot, Array<Cell | RowGroup | ColGroup>> = (slot, cover) => {
  if ("width" in cover) { // Cell or Col
    if (slot.x < cover.anchor.x) return false; // slot is left of cover
    if (cover.anchor.x + cover.width < slot.x) return false; // slot is right of cover
  }

  if ("height" in cover) { // Cell or Row
    if (slot.y < cover.anchor.y) return false; // slot is above cover
    if (cover.anchor.y + cover.height < slot.y) return false; // slot is below cover
  }

  return true;
};
