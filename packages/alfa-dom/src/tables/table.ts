import { Element } from "..";

import {Cell, ColGroup, RowGroup, isCovering, Row} from "./groups";
import { isElementByName } from "./helpers";
import assert = require("assert");

// https://html.spec.whatwg.org/multipage/tables.html#table-processing-model
export type Table = { width: number, height: number, cells: Array<Cell>, rowGroups: Array<RowGroup>, colGroups: Array<ColGroup> };
export function newTable(): Table {
  return { width: 0, height: 0, cells: [], rowGroups: [], colGroups: []}
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
export function rowProcessing(table: Table, tr: Element, yCurrent: number, growingCellsList: Array<Cell>): Array<Cell> {
  // 1
  assert(yCurrent <= table.height);
  if (table.height === yCurrent) {
    table.height++
  }
  // 2
   let xCurrent = 0;
  // 3
  growingCellsList = growingCellsList.map(cell => cell.growDownward(yCurrent));

  let children = tr.children().filter(isElementByName("th", "td"));
  for (const currentCell of children) { // loop control between 4-5, and 16-17-18
    // 6 (Cells)
    while (xCurrent < table.width &&
      table.cells.concat(growingCellsList).some(isCovering(xCurrent, yCurrent))
    ) {
      xCurrent++
    }
    // 7
    if (xCurrent === table.width) {
      table.width++
    }
    // 8, 9, 10, 13
    const { cell, downwardGrowing } = Cell.of(currentCell, xCurrent, yCurrent);
    // const cell = floatingCell.anchorAt(xCurrent, yCurrent);
    // 11
    table.width = Math.max(table.width, xCurrent + cell.width);
    // 12
    table.height = Math.max(table.height, yCurrent + cell.height);
    // 13
    // Double coverage check made at the end of table building to de-entangle code
    // 14
    if (downwardGrowing) {
      growingCellsList.push(cell);
    } else {
      // 13 only non-growing cells are stored for now to avoid storing the same cell in two places.
      table.cells.push(cell);
    }
    // 15
    xCurrent = xCurrent + cell.width;
  }
  return growingCellsList;
  // 4 and 16 done after the calls to avoid side effects.
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
export function processRowGroup(table: Table, group: Element, yCurrent: number): number {
  let growingCellsList: Array<Cell> = [];
  // 1
  const yStart = table.height;
  // 2
  for (const tr of group.children().filter(isElementByName("tr"))) {
    const row = Row.of(tr, table.cells, growingCellsList, yCurrent, table.width);
    table.cells = table.cells.concat(row.cells);
    growingCellsList = row.downwardGrowingCells;
    table.height = Math.max(table.height, yCurrent+1);
    table.width = Math.max(table.width, row.width);
    // row processing steps 4/16
    yCurrent++;
  }
  // 3
  if (table.height > yStart) {
    table.rowGroups.push(new RowGroup(yStart, table.height - yStart, group));
  }
  // 4
  // ending row group 1
  growingCellsList = growingCellsList.map(cell => cell.growDownward(table.height-1));
  // ending row group 2
  // When emptying the growing cells list, we need to finally add them to the table.
  table.cells = table.cells.concat(growingCellsList);
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
      growingCellsList = rowProcessing(table, currentElement, yCurrent, growingCellsList);
      // row processing steps 4/16
      yCurrent++;
      continue;
    }

    // 14
    // Ending row group 1
    growingCellsList = growingCellsList.map(cell => cell.growDownward(table.height-1));
    yCurrent = table.height;
    // Ending row group 2
    table.cells = table.cells.concat(growingCellsList);
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
  // Of course, errors are more or less caught and repaired by browsers.
  // Note that having a rowspan that extends out of the row group is not a table error per se!
  // checking for rows
  for (let row=0; row<table.height; row++) {
    let rowCovered = false;
    for (let col=0; !rowCovered && col<table.width; col++) {
      rowCovered = rowCovered || table.cells.some(cell => cell.anchor.x === col && cell.anchor.y === row);
    }
    if (!rowCovered) throw new Error(`row ${row} has no cell anchored in it`)
  }
  // checking for cols
  for (let col=0; col<table.width; col++) {
    let colCovered = false;
    for (let row=0; !colCovered && row<table.height; row++) {
      colCovered = colCovered || table.cells.some(cell => cell.anchor.x === col && cell.anchor.y === row);
    }
    if (!colCovered) throw new Error(`col ${col} has no cell anchored in it`)
  }
  // Checking for row forming algorithm step 13 (slot covered twice)
  for (let x = 0; x < table.width; x++) {
    for (let y = 0; y < table.height; y++) {
      if (table.cells.filter(isCovering(x, y)).length > 1) {
        throw new Error(`Slot (${x}, ${y}) is covered twice`)
      }
    }
  }

  // 21
  return table;
}
