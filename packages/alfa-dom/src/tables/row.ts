import {Equatable} from "@siteimprove/alfa-equatable";
import {Serializable} from "@siteimprove/alfa-json";
import { notDeepEqual} from "assert";
import {Element} from "..";
import { Cell } from "./groups";
import {isElementByName} from "./helpers";
import {isCovering} from "./is-covering";

import * as json from "@siteimprove/alfa-json";
import assert = require("assert");


// Build artifact, corresponds to a single <tr> element
// A row needs context to exists:
// * a list of cells that can potentially cover slots in it (rowspan > 1)
// * a list of downward growing cells that will grow into it
// * the y position of the row.
//
// y position (of the row and cells) can be relative to the group they are in or absolute in the table
// as long as they are all based in the same way…
export class Row implements Equatable, Serializable {
  private readonly _anchor: {y: number};
  private readonly _xCurrent: number; // current x position in processing the row
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _cells: Array<Cell>;
  private readonly _downwardGrowingCells: Array<Cell>;

  private constructor(y: number, w: number, h: number, element: Element, cells: Array<Cell> = [], growing: Array<Cell> = [], xCurrent: number = 0) {
    this._anchor = { y };
    this._xCurrent = xCurrent;
    this._width = w;
    this._height = h;
    this._element = element;
    this._cells = cells;
    this._downwardGrowingCells = growing;
  }

  public static of(y: number, w: number, h: number, element: Element, cells: Array<Cell> = [], growing: Array<Cell> = [], xCurrent: number = 0) {
    return new Row(y, w, h, element, cells, growing, xCurrent);
  }

  private _update(update: {y?: number, xCurrent?: number, width?: number, height?: number, element?: Element, cells?: Array<Cell>, downwardGrowingCells?: Array<Cell>}): Row {
    return Row.of(
      update.y !== undefined ? update.y : this._anchor.y,
      update.width !== undefined ? update.width : this._width,
      update.height !== undefined ? update.height : this._height,
      update.element !== undefined ? update.element : this._element,
      update.cells !== undefined ? update.cells : this._cells,
      update.downwardGrowingCells !== undefined ? update.downwardGrowingCells : this._downwardGrowingCells,
      update.xCurrent !== undefined ? update.xCurrent : this._xCurrent
    )
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

  private _growCells(y: number): Row {
    return this._update({downwardGrowingCells: this._downwardGrowingCells.map(cell => cell.growDownward(y))});
  }

  private _addNonGrowingCell(cell: Cell): Row {
    return this._update({cells: this._cells.concat(cell)});
  }
  private _addGrowingCell(cell: Cell): Row {
    return this._update({downwardGrowingCells: this._downwardGrowingCells.concat(cell)})
  }
  private _addCell(cell: Cell, downwardGrowing: boolean): Row {
    return downwardGrowing ? this._addGrowingCell(cell) : this._addNonGrowingCell(cell);
  }
  private _addCellFromElement(currentCell: Element, yCurrent: number): Row {
    // 8, 9, 10, 13
    const { cell, downwardGrowing } = Cell.from(currentCell, this._xCurrent, yCurrent);
    return this
      // 11
      ._adjustWidth(this._xCurrent + cell.width)
      // 12
      ._adjustHeight(cell.height)
      // 13
      // Double coverage check made at the end of table building to de-entangle code
      // 14
      ._addCell(cell, downwardGrowing);
  }

  private _adjustWidth(w: number): Row {
    return this._update({width: Math.max(this._width, w)})
  }
  private _adjustHeight(h: number): Row {
    return this._update({height: Math.max(this._height, h)})
  }

  // moves xCurrent to the first slot which is not already covered by one of the cells from the row or its context
  // step 6
  private _skipIfCovered(cells: Array<Cell>, yCurrent: number): Row {
    if (this._xCurrent < this._width &&
      cells.concat(this._cells, this._downwardGrowingCells).some(isCovering(this._xCurrent, yCurrent))
      ) {
      return this
        ._update({xCurrent: this._xCurrent + 1})
        ._skipIfCovered(cells, yCurrent)
    } else {
      return this
    }
  }

  private _enlargeIfNeeded(): Row {
    return this._xCurrent === this.width ?
      this._adjustWidth(this.width + 1)
      : this
  }

  // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
  public static from(tr: Element, cells: Array<Cell> = [], growingCells: Array<Cell> = [], yCurrent: number = 0, w: number = 0): Row {
    // cells and growingCells must be disjoint (a cell is either growing or not)
    cells.forEach(cell => growingCells.forEach(growingCell => notDeepEqual(cell, growingCell)));
    assert(tr.name === "tr");

    let children = tr.children().filter(isElementByName("th", "td"));

    // 1
    // global table height adjusted after building row

    // loop control between 4-5, and 16-17-18
    return children.reduce((row, currentCell) =>
        row
          // 6 (Cells)
          ._skipIfCovered(cells, yCurrent)
          // 7
          ._enlargeIfNeeded()
          // 8-14
          // 15 is actually not needed because it will be done as part of step 6 on next loop, and is useless on last element.
          ._addCellFromElement(currentCell, yCurrent),
      // 2 is done when creating the row, default value for xCurrent is 0.
      Row.of(yCurrent, w, 1, tr, [], growingCells)
        // 3
        ._growCells(yCurrent)
    );

    // return row;
    // 4 and 16 done after the calls to avoid side effects.
  }

  public equals(value: unknown): value is this {
    if (!(value instanceof Row)) return false;
    const sortedThisCells = this._cells.sort((a, b) => a.compare(b));
    const sortedValueCells = value._cells.sort((a, b) => a.compare(b));
    const sortedThisDGCells = this._downwardGrowingCells.sort((a, b) => a.compare(b));
    const sortedValueDGCells = value._downwardGrowingCells.sort((a, b) => a.compare(b));
    return (
      this._width === value._width &&
      this._height === value._height &&
      this._anchor.y === value._anchor.y &&
      this._element.equals(value._element) &&
      this._cells.length === value._cells.length &&
      sortedThisCells.every((cell, idx) => cell.equals(sortedValueCells[idx])) &&
      this._downwardGrowingCells.length === value._downwardGrowingCells.length &&
      sortedThisDGCells.every((cell, idx) => cell.equals(sortedValueDGCells[idx]))
    )
  }

  public toJSON(): Row.JSON {
    return {
      anchor: this._anchor,
      width: this._width,
      height: this._height,
      element: this._element.toJSON(),
      cells: this._cells.map(cell => cell.toJSON()),
      downwardGrowingCells: this._downwardGrowingCells.map(cell => cell.toJSON())
    }
  }

  public toString(): string {
    return `Row anchor: ${this._anchor.y}, width: ${this._width}, height: ${this._height}, element: ${this._element}, cells: ${this._cells}, downward growing cells: ${this._downwardGrowingCells}`
  }
}

export namespace Row {
  export interface JSON {
    [key: string]: json.JSON,
    anchor: { y: number },
    width: number,
    height: number,
    element: Element.JSON,
    cells: Cell.JSON[],
    downwardGrowingCells: Cell.JSON[]
  }
}
