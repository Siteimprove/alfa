import {clamp} from "@siteimprove/alfa-math";
import {Option, Some} from "@siteimprove/alfa-option";
import {Predicate} from "@siteimprove/alfa-predicate";
import {Iterable} from "@siteimprove/alfa-iterable";
import {Element, Namespace, Node} from "..";

const { and, equals, or, property } = Predicate;

// https://html.spec.whatwg.org/multipage/tables.html#table-processing-model

export type Slot = { x: number; y: number; elements: Iterable<Element>, cell: Option<Cell> };
type Table = { slots: Array<Array<Slot>>, width: number, height: number, cells: Iterable<Cell> };

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

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-growing-downward-growing-cells
function growingCell(cell: Cell, yCurrent: number):void {
  // we need yCurrent to be covered, hence y+h-1>=yCurrent, hence h>=yCurrent-y+1
  cell.height = Math.max(cell.height, yCurrent - cell.anchor.y + 1);
}

function growingCells(cells: Array<Cell>, yCurrent: number):void {
  cells.forEach(cell => growingCell(cell, yCurrent));
}

// Bad global variables! Bad!
let xCurrent=0, yCurrent=0, xWidth=0, yHeight=0;
let growingCellsList: Array<Cell>;
let theTable: Table;

// Bad copy from rule helpers. Move to DOM helpers?
function hasNamespace(
  predicate: Predicate<Namespace> = () => true
): Predicate<Element> {
  return element => element.namespace.some(predicate);
}

export function hasName<T extends { readonly name: string }>(
  predicate: Predicate<string> = () => true
): Predicate<T> {
  return property("name", predicate);
}

const isCell: Predicate<Node, Element> =
  and(Element.isElement,
    and(hasNamespace(equals(Namespace.HTML)),
      or(hasName(equals("td")),
        hasName(equals("th"))
      )));

function parsePositiveInt(str: string, failed: number): number {
  const raw = Number(str);
  return isNaN(raw) || raw < 0 ? failed : Math.floor(raw)
}

// Not exactly https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-non-negative-integers
// But should have the same effect for what is needed here.
// Should we have an Attribute helper for these parsing? Typing attribute values?
function parseSpan(element: Element, name: string, min: number, max: number, failed: number): number {
  const spanAttr = element.attribute(name);
  return spanAttr.isNone() ? failed : clamp(parsePositiveInt(spanAttr.get().value, failed), min, max);
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
function rowProcessing(tr: Element): void {
  let step = "";
  let children = tr.children().filter(isCell);
  let currentCell: Element;
  let grow: boolean;
  while (true) {
    if (step !== "cells") {
      // 1
      if (yHeight === yCurrent) { yHeight++ }
      // 2
      xCurrent = 0;
      // 3
      growingCells(growingCellsList, yCurrent);
      // 4
      if (children.isEmpty()) {
        yCurrent++;
        return;
      }
      // 5
      currentCell = children.first().get();
      children = children.rest();
    }
    // 6 (Cells)
    while (xCurrent < xWidth && theTable.slots[xCurrent][yCurrent].cell.isSome()) {
      xCurrent++
    }
    // 7
    if (xCurrent === xWidth) {
      xCurrent++
    }
    // 8 (need non-null assertion because can't tell that 5 is always run at least once. Bad!)
    const colspan = parseSpan(currentCell!, "colspan",1, 1000, 1);
    // 9 (need non-null assertion because can't tell that 5 is always run at least once. Bad!)
    let rowspan = parseSpan(currentCell!, "rowspan",0, 65534, 1);
    // 10 assuming we are not in quirks mode because I don't know if we test that yet…
    if (rowspan === 0) {
      grow = true;
      rowspan = 1;
    } else {
      grow = false;
    }
    // 11
    if (xWidth <= xCurrent + colspan ) {
      xWidth = xCurrent + colspan
    }
    // 12
    if (yHeight <= yCurrent + rowspan) {
      yHeight = yCurrent + rowspan
    }
    // 13
    const cell: Cell = {
      kind: hasName(equals("th"))(currentCell!) ? "header" : "data",
      anchor : {x: xCurrent, y: yCurrent},
      width: colspan,
      height: rowspan
    };
    for(let x=xCurrent; x<xCurrent+colspan; x++) {
      for(let y=yCurrent; y<yCurrent+rowspan; y++) {
        const slot =theTable.slots[x][y];
        if (slot.cell.isSome()) {
          throw new Error(`Slot (${x}, ${y}) is covered twice`)
        }
        slot.cell = Some.of(cell);
      }
    }
    // 14
    if (grow) {
      growingCellsList.push(cell);
    }
    // 15
    xCurrent = xCurrent + colspan;
    // 16
    if (children.isEmpty()) {
      yCurrent++;
      return;
    }
    // 17
    currentCell = children.first().get();
    children = children.rest();
    // 18
    step = "cells"
  }
}
