import {Equatable} from "@siteimprove/alfa-equatable";
import {Serializable} from "@siteimprove/alfa-json";
import {Err, Ok, Result} from "@siteimprove/alfa-result";
import { Element } from "..";

import {Cell, ColGroup, RowGroup, isCovering, Row, BuildingRowGroup} from "./groups";
import { isElementByName } from "./helpers";

import * as json from "@siteimprove/alfa-json";
import assert = require("assert");

// https://html.spec.whatwg.org/multipage/tables.html#table-processing-model
export class Table implements Equatable, Serializable {
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _cells: Array<Cell>;
  private readonly _rowGroups: Array<RowGroup>;
  private readonly _colGroups: Array<ColGroup>;

  private constructor(element: Element, w: number, h: number,cells: Array<Cell>, rowGroups: Array<RowGroup>, colGroups: Array<ColGroup>) {
    this._width = w;
    this._height = h;
    this._element = element;
    this._cells = cells;
    this._rowGroups = rowGroups;
    this._colGroups = colGroups;
  }

  public static of(element: Element, w: number = 0, h: number = 0, cells: Array<Cell> = [], rowGroups: Array<RowGroup> = [], colGroups: Array<ColGroup> = []) {
    return new Table(element, w, h, cells, rowGroups, colGroups)
  }

  private _update(update: { element?: Element, w?: number, h?: number, cells?: Array<Cell>, rowGroups?: Array<RowGroup>, colGroups?: Array<ColGroup> }) {
    return Table.of(
      update.element !== undefined ? update.element : this._element,
      update.w !== undefined ? update.w : this._width,
      update.h !== undefined ? update.h : this._height,
      update.cells !== undefined ? update.cells : this._cells,
      update.rowGroups !== undefined ? update.rowGroups : this._rowGroups,
      update.colGroups !== undefined ? update.colGroups : this._colGroups,
    )
  }

  public get width(){
    return this._width;
  }
  public get height(){
    return this._height;
  }
  public get cells(){
    return this._cells;
  }
  public get colGroups(){
    return this._colGroups;
  }
  public get rowGroups(){
    return this._rowGroups;
  }

  public static from(element: Element): Result<Table, string> {
    assert(element.name === "table");

    // 1, 2, 4, 11
    // let table = newTable();
    let table = Table.of(element);
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
          const colGroup = ColGroup.from(currentElement).anchorAt(table.width);
          // 9.1 (1).4 (cumulative) and (2).2
          // table.width += colGroup.width;
          table = table._update({w: table._width + colGroup.width});
          // 9.1 (1).7 and (2).3
          // table.colGroups.push(colGroup);
          table = table._update({colGroups: table._colGroups.concat(colGroup)});
        }
        continue;
      }

      // 12
      processCG = false;

      if (currentElement.name === "tr") {
        // 13 (process) can detect new downward growing cells

        const row = Row.from(currentElement, table.cells, growingCellsList, yCurrent, table.width);
        // table.cells = table.cells.concat(row.cells);
        table = table._update({cells: table._cells.concat(row.cells)});
        growingCellsList = row.downwardGrowingCells;
        // table.height = Math.max(table.height, yCurrent+1);
        table = table._update({h: Math.max(table._height, yCurrent+1)});
        // table.width = Math.max(table.width, row.width);
        table = table._update({w: Math.max(table._width, row.width)});
        // row processing steps 4/16
        yCurrent++;

        // growingCellsList = rowProcessing(table, currentElement, yCurrent, growingCellsList);
        // // row processing steps 4/16
        // yCurrent++;
        continue;
      }

      // 14
      // Ending row group 1
      growingCellsList = growingCellsList.map(cell => cell.growDownward(table.height-1));
      yCurrent = table._height;
      // Ending row group 2
      // table.cells = table.cells.concat(growingCellsList);
      table = table._update({cells: table._cells.concat(growingCellsList)});
      growingCellsList = [];

      if (currentElement.name === "tfoot") {
        // 15 (add to list)
        pendingTfoot.push(currentElement);
      }

      if (currentElement.name === "thead" || currentElement.name === "tbody") {
        // 16
        // process row group and anchor cells
        const rowgroup = BuildingRowGroup.from(currentElement).anchorAt(yCurrent);
        if (rowgroup.height > 0) {
          // adjust table height and width
          // table.height += rowgroup.height;
          table = table._update({h: table._height + rowgroup.height});
          // table.width = Math.max(table.width, rowgroup.width);
          table = table._update({w: Math.max(table._width, rowgroup.width)});
          // merge in new cells
          // table.cells = table.cells.concat(rowgroup.cells);
          table = table._update({cells: table._cells.concat(rowgroup.cells)});
          // add new group
          // table.rowGroups = table.rowGroups.concat(rowgroup.toRowGroup())
          table = table._update({rowGroups: table._rowGroups.concat(rowgroup.toRowGroup())})
        }
        yCurrent = table._height;
      }
    }

    // 19
    for (const tfoot of pendingTfoot) {
      const rowgroup = BuildingRowGroup.from(tfoot).anchorAt(yCurrent);
      if (rowgroup.height > 0) {
        // adjust table height and width
        // table.height += rowgroup.height;
        table = table._update({h: table._height + rowgroup.height});
        // table.width = Math.max(table.width, rowgroup.width);
        table = table._update({w: Math.max(table._width, rowgroup.width)});
        // merge in new cells
        // table.cells = table.cells.concat(rowgroup.cells);
        table = table._update({cells: table._cells.concat(rowgroup.cells)});
        // add new group
        // table.rowGroups = table.rowGroups.concat(rowgroup.toRowGroup())
        table = table._update({rowGroups: table._rowGroups.concat(rowgroup.toRowGroup())})
      }
      yCurrent = table._height;
      // yCurrent = processRowGroup(table, tfoot, yCurrent);
    }
    // 20
    // Of course, errors are more or less caught and repaired by browsers.
    // Note that having a rowspan that extends out of the row group is not a table error per se!
    // checking for rows
    for (let row=0; row<table._height; row++) {
      let rowCovered = false;
      for (let col=0; !rowCovered && col<table._width; col++) {
        rowCovered = rowCovered || table._cells.some(cell => cell.anchor.x === col && cell.anchor.y === row);
      }
      if (!rowCovered) return Err.of(`row ${row} has no cell anchored in it`)
    }
    // checking for cols
    for (let col=0; col<table._width; col++) {
      let colCovered = false;
      for (let row=0; !colCovered && row<table._height; row++) {
        colCovered = colCovered || table._cells.some(cell => cell.anchor.x === col && cell.anchor.y === row);
      }
      if (!colCovered) return Err.of(`col ${col} has no cell anchored in it`)
    }
    // Checking for row forming algorithm step 13 (slot covered twice)
    for (let x = 0; x < table._width; x++) {
      for (let y = 0; y < table._height; y++) {
        if (table._cells.filter(isCovering(x, y)).length > 1) {
          return Err.of(`Slot (${x}, ${y}) is covered twice`)
        }
      }
    }

    // 21
    return Ok.of(table);
  }


  public equals(value: unknown): value is this {
    if (!(value instanceof Table)) return false;
    const sortedThisCells = this._cells.sort((a, b) => a.compare(b));
    const sortedValueCells = value._cells.sort((a, b) => a.compare(b));
    const sortedThisRowGroup = this._rowGroups.sort((a, b) => a.compare(b));
    const sortedValueRowGroup = value._rowGroups.sort((a, b) => a.compare(b));
    const sortedThisColGroup = this._colGroups.sort((a, b) => a.compare(b));
    const sortedValueColGroup = value._colGroups.sort((a, b) => a.compare(b));
    return (
      this._width === value._width &&
      this._height === value._height &&
      sortedThisCells.length === sortedValueCells.length &&
      sortedThisCells.every((cell, idx) => cell.equals(sortedValueCells[idx])) &&
      sortedThisRowGroup.length === sortedValueRowGroup.length &&
      sortedThisRowGroup.every((cell, idx) => cell.equals(sortedValueRowGroup[idx])) &&
      sortedThisColGroup.length === sortedValueColGroup.length &&
      sortedThisColGroup.every((cell, idx) => cell.equals(sortedValueColGroup[idx]))
    )
  }

  public toJSON(): Table.JSON {
    return {
      height: this._height,
      width: this._width,
      element: this._element.toJSON(),
      cells: this._cells.map(cell => cell.toJSON()),
      rowGroups: this._rowGroups.map(rg => rg.toJSON()),
      colGroups: this._colGroups.map(cg => cg.toJSON())
    }
  }

  public toString(): string {
    return `Table width: ${this._width}, height: ${this._height}, element: ${this._element}, cells: ${this._cells}, row groups: ${this._rowGroups}, column groups: ${this._colGroups}`
  }
}

export namespace Table {
  export interface JSON {
    [key: string]: json.JSON,
    height: number,
    width: number,
    element: Element.JSON,
    cells: Cell.JSON[],
    rowGroups: RowGroup.JSON[],
    colGroups: ColGroup.JSON[]
  }
}
