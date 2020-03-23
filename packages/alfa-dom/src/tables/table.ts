import { Iterable } from "@siteimprove/alfa-iterable";
import { Reducer } from "@siteimprove/alfa-reducer";
import { Set } from "@siteimprove/alfa-set";
import { Element } from "..";

import {Cell, ColGroup, RowGroup, isCovering} from "./groups";
import { isElementByName } from "./helpers";
import assert = require("assert");

// https://html.spec.whatwg.org/multipage/tables.html#table-processing-model
export type Table = { width: number, height: number, cells: Set<Cell>, rowGroups: Array<RowGroup>, colGroups: Array<ColGroup> };
export function newTable(): Table {
  return { width: 0, height: 0, cells: Set.empty(), rowGroups: [], colGroups: []}
}

function growCellInSet(yCurrent: number): Reducer<Cell, Set<Cell>> {
  return (set: Set<Cell>, cell: Cell) =>
    set.delete(cell).add(cell.growDownward(yCurrent));
}

const growCellList = (yCurrent: number) => (cells: Iterable<Cell>, set: Set<Cell>) =>
  Iterable.reduce<Cell, Set<Cell>>(cells, growCellInSet(yCurrent), set);

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
export function rowProcessing(table: Table, tr: Element, yCurrent: number, growingCellsList: Array<Cell>): Array<Cell> {
  // 1
  assert(yCurrent <= table.height);
  if (table.height === yCurrent) {
    table.height++
  }
  // 2
   let xCurrent = 0;
  // 3 no need to grow the cells by one line. They will anyway all be adjusted to correct height later.

  let children = tr.children().filter(isElementByName("th", "td"));
  for (const currentCell of children) { // loop control between 4-5, and 16-17-18
    // 6 (Cells)
    while (xCurrent < table.width &&
      table.cells.some(isCovering(xCurrent, yCurrent))
    ) {
      xCurrent++
    }
    // 7
    if (xCurrent === table.width) {
      table.width++
    }
    // 8, 9, 10, 13
    const { cell: floatingCell, downwardGrowing } = Cell.of(currentCell);
    const cell = floatingCell.anchorAt(xCurrent, yCurrent);
    // 11
    table.width = Math.max(table.width, xCurrent + cell.width);
    // 12
    table.height = Math.max(table.height, yCurrent + cell.height);
    // 13
    for (let x = xCurrent; x < xCurrent + cell.width; x++) {
      for (let y = yCurrent; y < yCurrent + cell.height; y++) {
        if (table.cells.some(isCovering(x, y))) {
          throw new Error(`Slot (${x}, ${y}) is covered twice`)
        }
      }
    }
    table.cells = table.cells.add(cell);
    // 14
    if (downwardGrowing) growingCellsList.push(cell);
    // 15
    xCurrent = xCurrent + cell.width;
  }
  return growingCellsList;
  // 4 and 16 done after the calls to avoid side effects.
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-ending-a-row-group
// export function endRowGroup(table: Table): void {
//   // 1.1, growingCells can grow by more than 1 at a time.
//   table.cells.forEach(growingCell(table.height,false));
//   // 1.2 done after call
// }

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
export function processRowGroup(table: Table, group: Element, yCurrent: number): number {
  let growingCellsList: Array<Cell> = [];
  // 1
  const yStart = table.height;
  // 2
  for (const row of group.children().filter(isElementByName("tr"))) {
    growingCellsList.push(...rowProcessing(table, row, yCurrent, growingCellsList)); // Modify table.
    // row processing steps 4/16
    yCurrent++;
  }
  // 3
  if (table.height > yStart) {
    table.rowGroups.push(new RowGroup(yStart, table.height - yStart, group));
  }
  // 4
  // ending row group 1
  table.cells = growCellList(table.height)(growingCellsList, table.cells);
  // ending row group 2 is needless because growing cell list is local.
  return table.height;
}

export function formingTable(element: Element): Table {
  // 1, 2, 4, 11
  const table = newTable();
  // 3
  let pendingTfoot: Array<Element> = [];
  // 5 + 8 + 9.3
  let children = element.children().filter(isElementByName("colgroup", "thead", "tbody", "tfoot", "tr"));
  // 6
  // skipping caption for now

  // 10
  let yCurrent = 0;

  // 11
  let growingCellsList: Array<Cell> = [];

  let processCG = true;
  for (const currentElement of children) { // loop control is 7 + 9.2 + 13 (advance) + 15 (advance) + 17 + 18

    if (currentElement.name === "colgroup") {
      // 9.1 (Columns group)
      if (processCG) {
        const colGroup = ColGroup.of(currentElement).anchorAt(table.width);
        // 9.1 (1).4 (cumulative) and (2).2
        table.width += colGroup.width;
        // 9.1 (1).7 and (2).3
        table.colGroups.push(colGroup);
      }
      continue;
    }

    // 12
    processCG = false;

    if (currentElement.name === "tr") {
      // 13 (process) can detect new downward growing cells
      growingCellsList.push(...rowProcessing(table, currentElement, yCurrent, growingCellsList));
      // row processing steps 4/16
      yCurrent++;
      continue;
    }

    // 14
    // Ending row group 1
    table.cells = growCellList(table.height)(growingCellsList, table.cells);
    yCurrent = table.height;
    // Ending row group 2
    growingCellsList = [];

    if (currentElement.name === "tfoot") {
      // 15 (add to list)
      pendingTfoot.push(currentElement);
    }

    if (currentElement.name === "thead" || currentElement.name === "tbody") {
      // 16
      yCurrent = processRowGroup(table, currentElement, yCurrent);
    }
  }

  // 19
  for (const tfoot of pendingTfoot) {
    yCurrent = processRowGroup(table, tfoot, yCurrent);
  }
  // 20
  // checking for rows
  for (let row=0; row<table.height; row++) {
    let rowCovered = false;
    for (let col=0; !rowCovered && col<table.width; col++) {
      rowCovered = rowCovered || table.cells.some(isCovering(col, row));
    }
    if (!rowCovered) throw new Error(`row ${row} is not covered`)
  }
  // checking for cols
  for (let col=0; col<table.width; col++) {
    let colCovered = false;
    for (let row=0; !colCovered && row<table.height; row++) {
      colCovered = colCovered || table.cells.some(isCovering(col, row));
    }
    if (!colCovered) throw new Error(`col ${col} is not covered`)
  }
  // 21
  return table;
}
