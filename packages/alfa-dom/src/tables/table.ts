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
  return (set: Set<Cell>, cell: Cell) => {
    console.log(`  Now growing ${cell.element.attribute("id").get()}`);
    console.log(`  cells before:`);
    console.dir([...set].map(cell => ({name: cell.element.attribute("id").get().value})));
    const setdel = set.delete(cell);
    console.log(`  cells middle:`);
    console.dir([...setdel].map(cell => ({name: cell.element.attribute("id").get().value})));
    const setfin = setdel.add(cell.growDownward(yCurrent));
    console.log(`  cells after:`);
    console.dir([...setfin].map(cell => ({name: cell.element.attribute("id").get().value})));
    return setfin;
    // return set.delete(cell).add(cell.growDownward(yCurrent));
}}

const growCellList = (yCurrent: number) => (cells: Iterable<Cell>, set: Set<Cell>) =>
  // { console.log(`  Need to grow ${[...Iterable.map(cells, cell => cell.element.attribute("id").get())]}`);
{return Iterable.reduce<Cell, Set<Cell>>(cells, growCellInSet(yCurrent), set);};

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
export function rowProcessing(table: Table, tr: Element, yCurrent: number, growingCellsList: Array<Cell>): Array<Cell> {
  // console.log(`starting ${tr.attribute("id").get()} with height ${table.height}`);
  // console.log(`cells: ${table.cells.map(cell => cell.element.attribute("id").get())}`);
  // console.log(`growing cells: ${growingCellsList.map(cell => cell.element.attribute("id").get())}`);
  // const newGrowingCells: Array<Cell> = [];
  // 1
  assert(yCurrent <= table.height);
  if (table.height === yCurrent) {
    table.height++
  }
  // 2
   let xCurrent = 0;
  // 3
  // console.log(`-----  from rowProcessing ----`);
  // console.log(`cells before:`);
  // console.dir([...table.cells].map(cell => ({name: cell.element.attribute("id").get().value})));
  // table.cells = growCellList(table.height-1)(growingCellsList, table.cells);
  growingCellsList = growingCellsList.map(cell => cell.growDownward(yCurrent));
  // console.log(`cells after:`);
  // console.dir([...table.cells].map(cell => ({name: cell.element.attribute("id").get().value})));

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
    const { cell: floatingCell, downwardGrowing } = Cell.of(currentCell);
    // console.log(`   Processed ${floatingCell.element.attribute("id").get()}, grow: ${downwardGrowing}`);
    const cell = floatingCell.anchorAt(xCurrent, yCurrent);
    // 11
    table.width = Math.max(table.width, xCurrent + cell.width);
    // 12
    table.height = Math.max(table.height, yCurrent + cell.height);
    // 13
    // Double coverage check made at the end of table building to de-entangle code
    // table.cells = table.cells.add(cell);
    // 14
    if (downwardGrowing) {
      growingCellsList.push(cell);
    } else {
      // 13
      table.cells = table.cells.add(cell);
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
  for (const row of group.children().filter(isElementByName("tr"))) {
    growingCellsList = rowProcessing(table, row, yCurrent, growingCellsList); // Modify table.
    // row processing steps 4/16
    yCurrent++;
  }
  // 3
  if (table.height > yStart) {
    table.rowGroups.push(new RowGroup(yStart, table.height - yStart, group));
  }
  // 4
  // ending row group 1
  // console.log(`-----  from processRowGroup (ending) ----`);
  // console.log(`cells before:`);
  // console.dir([...table.cells].map(cell => ({name: cell.element.attribute("id").get().value})));
  // table.cells = growCellList(table.height-1)(growingCellsList, table.cells);
  growingCellsList = growingCellsList.map(cell => cell.growDownward(table.height-1));
  // console.log(`cells after:`);
  // console.dir([...table.cells].map(cell => ({name: cell.element.attribute("id").get().value})));
  // ending row group 2
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
    // table.cells = growCellList(table.height-1)(growingCellsList, table.cells);
    yCurrent = table.height;
    // Ending row group 2
    table.cells = table.cells.union(growingCellsList);
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
  // Checking for row forming algorithm step 13 (slot covered twice)
  for (let x = 0; x < table.width; x++) {
    for (let y = 0; y < table.height; y++) {
      if (table.cells.filter(isCovering(x, y)).size > 1) {
        throw new Error(`Slot (${x}, ${y}) is covered twice`)
      }
    }
  }

  // 21
  return table;
}
