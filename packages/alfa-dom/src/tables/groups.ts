import {Predicate} from "@siteimprove/alfa-predicate";
import {Element, Table} from "..";
import {hasName, isElementByName, parseSpan} from "./helpers";

import assert = require("assert");

const { equals } = Predicate;

// https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
export class RowGroup {
  private readonly _anchor: {y: number};
  private readonly _height: number;
  private readonly _element: Element;

  constructor(y: number, height: number, element: Element) {
    this._anchor = { y };
    this._height = height;
    this._element = element;
  }

  public get anchor() {
    return this._anchor;
  }
  public get height() {
    return this._height;
  }
  public get element() {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return true;
  }
  public isColGroup(): this is ColGroup {
    return false;
  }
}


// https://html.spec.whatwg.org/multipage/tables.html#concept-column-group
export class ColGroup {
  private readonly _anchor: {x: number};
  private readonly _width: number;
  private readonly _element: Element;

  constructor(x: number, width: number, element: Element) {
    this._anchor = { x };
    this._width = width;
    this._element = element;
  }

  public get anchor() {
    return this._anchor;
  }
  public get width() {
    return this._width;
  }
  public get element() {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return false;
  }
  public isColGroup(): this is ColGroup {
    return true;
  }
  public anchorAt(x: number): ColGroup {
    return new ColGroup(x, this._width, this._element);
  }

  // https://html.spec.whatwg.org/multipage/tables.html#forming-a-table
  // global step 9.1
  public static of(colgroup: Element): ColGroup {
    assert(colgroup.name === "colgroup");
    let children = colgroup.children().filter(isElementByName("col"));
    let totalSpan = 0;
    if (children.isEmpty()) { // second case
      // 1
      totalSpan = parseSpan(colgroup, "span", 1, 1000, 1);
    } else { // first case
      // 1
      for (const currentCol of children) { // loop control is 2 and 6
        // 3 (Columns)
        const span = parseSpan(currentCol, "span", 1, 1000, 1);
        totalSpan += span;
        // 5
        // The col element represents column within the colgroup but is not a colgroup itself. The rest of the algorithm seems to never use that again…
        // const colGroup: ColGroup = { anchor: {x: global.theTable.width - span}, width: span, element: currentCol}; // need better name! Technically not a "column group"…
        // global.theTable.colGroups.push(colGroup);
      }
    }
    // 1.4 and 1.7 done in main function
    // 2.2 and 2.3 done in main function
    return new ColGroup(-1, totalSpan, colgroup);
  }

}

// https://html.spec.whatwg.org/multipage/tables.html#concept-cell
export class Cell {
  private readonly _kind: "data" | "header";
  private readonly _anchor: { x: number, y: number };
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;

  constructor(kind: "data" | "header", x: number, y: number, w: number, h: number, element: Element) {
    this._kind = kind;
    this._anchor = { x, y };
    this._width = w;
    this._height = h;
    this._element = element;
  }

  public get anchor() {
    return this._anchor;
  }
  public get width() {
    return this._width;
  }
  public get height() {
    return this._height;
  }
  public get kind() {
    return this._kind;
  }
  public get element() {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return true;
  }
  public isColGroup(): this is ColGroup {
    return true;
  }

  public anchorAt(x: number, y: number): Cell {
    return new Cell(this._kind, x, y, this._width, this._height, this._element);
  }

  // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-growing-downward-growing-cells
  public growDownward(yCurrent: number): Cell {
    // we need yCurrent to be covered, hence y+h-1>=yCurrent, hence h>=yCurrent-y+1
    return new Cell(this._kind, this._anchor.x, this._anchor.y, this._width, Math.max(this._height, yCurrent - this._anchor.y + 1), this._element);
  }

  // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
  public static of(cell: Element, x: number = -1, y: number = -1): ({cell: Cell, downwardGrowing: boolean}) {
    const colspan = parseSpan(cell, "colspan", 1, 1000, 1);
    // 9
    let rowspan = parseSpan(cell, "rowspan", 0, 65534, 1);
    // 10 assuming we are not in quirks mode because I don't know if we test that yet…
    // Unsurprisingly, "rowspan=0" is not universally supported (that is, not by Edge…)
    const grow = (rowspan === 0);
    if (rowspan === 0) {
      rowspan = 1
    }
    // 11
    return ({
      cell: new Cell(hasName(equals("th"))(cell) ? "header" : "data", x, y, colspan, rowspan, cell),
      downwardGrowing: grow
    });
  }
}

export function isCovering(x: number, y: number): Predicate<Cell | RowGroup | ColGroup> {
  function covering(cover: Cell | RowGroup | ColGroup) {
    if (cover.isColGroup()) { // Cell or Col
      if (x < cover.anchor.x) { // slot is left of cover
        return false;
      }
      if (cover.anchor.x + cover.width - 1 < x) { // slot is right of cover
        return false;
      }
    }

    if (cover.isRowGroup()) { // Cell or Row
      if (y < cover.anchor.y) { // slot is above cover
        return false;
      }
      if (cover.anchor.y + cover.height - 1 < y) { // slot is below cover
        return false;
      }
    }

    return true;
  }
  return covering;
}

// Build artefact, corresponds to a single <tr> element
// A row needs context to exists:
// * a list of cells that can potentially cover slots in it (rowspan > 1)
// * a list of downward growing cells that will grow into it
// * the y position of the row.
export class Row {
  private readonly _anchor: {y: number};
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _cells: Array<Cell>;
  private readonly _downwardGrowingCells: Array<Cell>;

  constructor(y: number, w: number, h: number, element: Element, cells: Array<Cell> = [], growing: Array<Cell> = []) {
    this._anchor = { y };
    this._width = w;
    this._height = h;
    this._element = element;
    this._cells = cells;
    this._downwardGrowingCells = growing;
  }

  public get anchor() {
    return this._anchor;
  }
  public get width() {
    return this._width;
  }
  public get height() {
    return this._height;
  }
  public get element() {
    return this._element;
  }
  public get cells() {
    return this._cells;
  }
  public get downwardGrowingCells() {
    return this._downwardGrowingCells;
  }

  public addCell(cell: Cell): Row {
    return new Row(this._anchor.y, this._width, this._height, this._element, this._cells.concat(cell), this._downwardGrowingCells);
  }
  public addGrowingCell(cell: Cell): Row {
    return new Row(this._anchor.y, this._width, this._height, this._element, this._cells, this._downwardGrowingCells.concat(cell));
  }

  public adjustWidth(w: number): Row {
    return new Row(this._anchor.y, Math.max(this._width, w), this._height, this._element, this._cells);
  }
  public adjustHeight(h: number): Row {
    return new Row(this._anchor.y, this._width, Math.max(this._height, h), this._element, this._cells);
  }

  // // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
  // public of(cells: Array<Cell>, growingCells: Array<Cell>, yCurrent: number, tr: Element): Row {
  //   // cells and growingCells must be disjoint (a cell is either growing or not)
  //   assert
  //   // table: Table, tr: Element, yCurrent: number, growingCellsList: Array<Cell>): Array<Cell> {
  //   // 1
  //   assert(yCurrent <= table.height);
  //   if (table.height === yCurrent) {
  //     table.height++
  //   }
  //   // 2
  //   let xCurrent = 0;
  //   // 3
  //   growingCellsList = growingCellsList.map(cell => cell.growDownward(yCurrent));
  //
  //   let children = tr.children().filter(isElementByName("th", "td"));
  //   for (const currentCell of children) { // loop control between 4-5, and 16-17-18
  //     // 6 (Cells)
  //     while (xCurrent < table.width &&
  //       table.cells.concat(growingCellsList).some(isCovering(xCurrent, yCurrent))
  //       ) {
  //       xCurrent++
  //     }
  //     // 7
  //     if (xCurrent === table.width) {
  //       table.width++
  //     }
  //     // 8, 9, 10, 13
  //     const { cell: floatingCell, downwardGrowing } = Cell.of(currentCell, xCurrent, yCurrent);
  //     // const cell = floatingCell.anchorAt(xCurrent, yCurrent);
  //     // 11
  //     table.width = Math.max(table.width, xCurrent + cell.width);
  //     // 12
  //     table.height = Math.max(table.height, yCurrent + cell.height);
  //     // 13
  //     // Double coverage check made at the end of table building to de-entangle code
  //     // 14
  //     if (downwardGrowing) {
  //       growingCellsList.push(cell);
  //     } else {
  //       // 13 only non-growing cells are stored for now to avoid storing the same cell in two places.
  //       table.cells.push(cell);
  //     }
  //     // 15
  //     xCurrent = xCurrent + cell.width;
  //   }
  //   return growingCellsList;
  //   // 4 and 16 done after the calls to avoid side effects.
  // }

}
