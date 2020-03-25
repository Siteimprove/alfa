import {notDeepEqual} from "assert";
import {Element} from "..";
import {Cell} from "./cell";
import {isElementByName} from "./helpers";
import {isCovering} from "./is-covering";

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

  _growCells(y: number): Row {
    return new Row(this._anchor.y, this._width, this._height, this._element,
      this._cells, this._downwardGrowingCells.map(cell => cell.growDownward(y)));
  }

  _addNonGrowingCell(cell: Cell): Row {
    // console.log(`      Adding non growing ${cell.name}`);
    return new Row(this._anchor.y, this._width, this._height, this._element, this._cells.concat(cell), this._downwardGrowingCells);
  }
  _addGrowingCell(cell: Cell): Row {
    // console.log(`      Adding growing ${cell.name}`);
    // console.log(`      Currently growing: ${this._downwardGrowingCells.map(cell => cell.name)}`);
    // console.log(`      Expected growing: ${this._downwardGrowingCells.concat(cell).map(cell => cell.name)}`);
    return new Row(this._anchor.y, this._width, this._height, this._element, this._cells, this._downwardGrowingCells.concat(cell));
  }
  public addCell(cell: Cell, downwardGrowing: boolean): Row {
    return downwardGrowing ? this._addGrowingCell(cell) : this._addNonGrowingCell(cell);
  }

  _adjustWidth(w: number): Row {
    return new Row(this._anchor.y, Math.max(this._width, w), this._height, this._element, this._cells, this._downwardGrowingCells);
  }
  _adjustHeight(h: number): Row {
    return new Row(this._anchor.y, this._width, Math.max(this._height, h), this._element, this._cells, this._downwardGrowingCells);
  }

  // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
  public static of(tr: Element, cells: Array<Cell> = [], growingCells: Array<Cell> = [], yCurrent: number = 0, w: number = 0): Row {
    // cells and growingCells must be disjoint (a cell is either growing or not)
    cells.forEach(cell => growingCells.forEach(growingCell => notDeepEqual(cell, growingCell)));

    let row = new Row(yCurrent, w, 1, tr, [], growingCells);

    // 1
    // global table height adjusted after building row
    // 2
    let xCurrent = 0;
    // 3
    row = row._growCells(yCurrent);

    let children = tr.children().filter(isElementByName("th", "td"));
    for (const currentCell of children) { // loop control between 4-5, and 16-17-18
      // 6 (Cells)
      while (xCurrent < row.width &&
        cells.concat(row._cells, row._downwardGrowingCells).some(isCovering(xCurrent, yCurrent))
        ) {
        xCurrent++
      }
      // 7
      if (xCurrent === row.width) {
        row = row._adjustWidth(row.width + 1);
      }

      // 8, 9, 10, 13
      const { cell, downwardGrowing } = Cell.of(currentCell, xCurrent, yCurrent);
      // 11
      row = row._adjustWidth(xCurrent + cell.width);
      // 12
      row = row._adjustHeight(yCurrent + cell.height);
      // 13
      // Double coverage check made at the end of table building to de-entangle code
      // 14
      row = row.addCell(cell, downwardGrowing);
      // 15
      xCurrent = xCurrent + cell.width;
    }
    return row;
    // 4 and 16 done after the calls to avoid side effects.
  }

}
