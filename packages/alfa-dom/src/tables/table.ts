import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Element } from "..";
import {
  Cell,
  ColGroup,
  RowGroup,
  isCovering,
  Row,
  BuildingRowGroup,
} from "./groups";
import { isElementByName } from "./helpers";

import assert = require("assert");

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#table-processing-model
 */
export class Table implements Equatable, Serializable {
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _cells: Array<Cell>;
  private readonly _rowGroups: Array<RowGroup>;
  private readonly _colGroups: Array<ColGroup>;

  public static of(
    element: Element,
    w: number = 0,
    h: number = 0,
    cells: Array<Cell> = [],
    rowGroups: Array<RowGroup> = [],
    colGroups: Array<ColGroup> = []
  ): Table {
    return new Table(element, w, h, cells, rowGroups, colGroups);
  }

  private constructor(
    element: Element,
    w: number,
    h: number,
    cells: Array<Cell>,
    rowGroups: Array<RowGroup>,
    colGroups: Array<ColGroup>
  ) {
    this._width = w;
    this._height = h;
    this._element = element;
    this._cells = cells;
    this._rowGroups = rowGroups;
    this._colGroups = colGroups;
  }

  private _update(update: {
    element?: Element;
    w?: number;
    h?: number;
    cells?: Array<Cell>;
    rowGroups?: Array<RowGroup>;
    colGroups?: Array<ColGroup>;
  }): Table {
    return Table.of(
      update.element !== undefined ? update.element : this._element,
      update.w !== undefined ? update.w : this._width,
      update.h !== undefined ? update.h : this._height,
      update.cells !== undefined ? update.cells : this._cells,
      update.rowGroups !== undefined ? update.rowGroups : this._rowGroups,
      update.colGroups !== undefined ? update.colGroups : this._colGroups
    );
  }

  public get width(): number {
    return this._width;
  }
  public get height(): number {
    return this._height;
  }
  public get cells(): Iterable<Cell> {
    return this._cells;
  }
  public get colGroups(): Iterable<ColGroup> {
    return this._colGroups;
  }
  public get rowGroups(): Iterable<RowGroup> {
    return this._rowGroups;
  }

  private _adjustWidth(w: number): Table {
    return this._update({ w: Math.max(this._width, w) });
  }
  private _adjustHeight(h: number): Table {
    return this._update({ h: Math.max(this._height, h) });
  }

  private _addColGroup(colGroup: ColGroup): Table {
    return this._update({ colGroups: this._colGroups.concat(colGroup) });
  }
  private _addRowGroup(rowGroup: RowGroup): Table {
    return this._update({ rowGroups: this._rowGroups.concat(rowGroup) });
  }

  private _addCells(cells: Iterable<Cell>): Table {
    return this._update({ cells: this._cells.concat(...cells) });
  }

  private _addRowGroupFromElement(rowgroup: Element, yCurrent: number): Table {
    const rowGroup = BuildingRowGroup.from(rowgroup).anchorAt(yCurrent);
    if (rowGroup.height > 0) {
      return (
        this
          // adjust table height and width
          ._adjustHeight(this._height + rowGroup.height)
          ._adjustWidth(rowGroup.width)
          // merge in new cells
          ._addCells(rowGroup.cells)
          // add new group
          ._addRowGroup(rowGroup.toRowGroup())
      );
    } else {
      return this;
    }
  }

  public static from(element: Element): Result<Table, string> {
    assert(element.name === "table");

    // 1, 2, 4, 11
    let table = Table.of(element);
    // 3
    let pendingTfoot: Array<Element> = [];
    // 5 + 8 + 9.3
    let children = element
      .children()
      .filter(isElementByName("colgroup", "thead", "tbody", "tfoot", "tr"));
    // 6
    // skipping caption for now

    // 10
    let yCurrent = 0;

    // 11
    let growingCellsList: Array<Cell> = [];

    let processCG = true;
    for (const currentElement of children) {
      // loop control is 7 + 9.2 + 13 (advance) + 15 (advance) + 17 + 18

      if (currentElement.name === "colgroup") {
        // 9.1 (Columns group)
        if (processCG) {
          const colGroup = ColGroup.from(currentElement).anchorAt(table.width);
          table = table
            // 9.1 (1).4 (cumulative) and (2).2
            ._adjustWidth(table._width + colGroup.width)
            // 9.1 (1).7 and (2).3
            ._addColGroup(colGroup);
        }
        continue;
      }

      // 12
      processCG = false;

      if (currentElement.name === "tr") {
        // 13 (process) can detect new downward growing cells

        const row = Row.from(
          currentElement,
          table._cells,
          growingCellsList,
          yCurrent,
          table._width
        );
        growingCellsList = [...row.downwardGrowingCells];
        table = table
          ._addCells(row.cells)
          ._adjustHeight(yCurrent + 1)
          ._adjustWidth(row.width);
        // row processing steps 4/16
        yCurrent++;

        continue;
      }

      // 14
      // Ending row group 1
      growingCellsList = growingCellsList.map((cell) =>
        cell.growDownward(table.height - 1)
      );
      yCurrent = table._height;
      // Ending row group 2
      table = table._addCells(growingCellsList);
      growingCellsList = [];

      if (currentElement.name === "tfoot") {
        // 15 (add to list)
        pendingTfoot.push(currentElement);
      }

      if (currentElement.name === "thead" || currentElement.name === "tbody") {
        // 16
        // process row group and anchor cells
        table = table._addRowGroupFromElement(currentElement, yCurrent);
        yCurrent = table._height;
      }
    }

    // 19
    for (const tfoot of pendingTfoot) {
      table = table._addRowGroupFromElement(tfoot, yCurrent);
      yCurrent = table._height;
    }
    // 20
    // Of course, errors are more or less caught and repaired by browsers.
    // Note that having a rowspan that extends out of the row group is not a table error per se!
    // checking for rows
    for (let row = 0; row < table._height; row++) {
      let rowCovered = false;
      for (let col = 0; !rowCovered && col < table._width; col++) {
        rowCovered =
          rowCovered ||
          table._cells.some(
            (cell) => cell.anchor.x === col && cell.anchor.y === row
          );
      }
      if (!rowCovered) return Err.of(`row ${row} has no cell anchored in it`);
    }
    // checking for cols
    for (let col = 0; col < table._width; col++) {
      let colCovered = false;
      for (let row = 0; !colCovered && row < table._height; row++) {
        colCovered =
          colCovered ||
          table._cells.some(
            (cell) => cell.anchor.x === col && cell.anchor.y === row
          );
      }
      if (!colCovered) return Err.of(`col ${col} has no cell anchored in it`);
    }
    // Checking for row forming algorithm step 13 (slot covered twice)
    for (let x = 0; x < table._width; x++) {
      for (let y = 0; y < table._height; y++) {
        if (table._cells.filter(isCovering(x, y)).length > 1) {
          return Err.of(`Slot (${x}, ${y}) is covered twice`);
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
      sortedThisCells.every((cell, idx) =>
        cell.equals(sortedValueCells[idx])
      ) &&
      sortedThisRowGroup.length === sortedValueRowGroup.length &&
      sortedThisRowGroup.every((cell, idx) =>
        cell.equals(sortedValueRowGroup[idx])
      ) &&
      sortedThisColGroup.length === sortedValueColGroup.length &&
      sortedThisColGroup.every((cell, idx) =>
        cell.equals(sortedValueColGroup[idx])
      )
    );
  }

  public toJSON(): Table.JSON {
    return {
      height: this._height,
      width: this._width,
      element: this._element.toJSON(),
      cells: this._cells.map((cell) => cell.toJSON()),
      rowGroups: this._rowGroups.map((rg) => rg.toJSON()),
      colGroups: this._colGroups.map((cg) => cg.toJSON()),
    };
  }
}

export namespace Table {
  export interface JSON {
    [key: string]: json.JSON;
    height: number;
    width: number;
    element: Element.JSON;
    cells: Cell.JSON[];
    rowGroups: RowGroup.JSON[];
    colGroups: ColGroup.JSON[];
  }
}
