import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Element } from "..";
import { BuildingCell, Cell } from "./groups";
import { isElementByName } from "./helpers";

/**
 * Build artifact, corresponds to a single <tr> element
 * A row needs context to exists:
 * * a list of cells that can potentially cover slots in it (rowspan > 1)
 * * a list of downward growing cells that will grow into it
 * * the y position of the row.
 *
 * y position (of the row and cells) can be relative to the group they are in or absolute in the table
 * as long as they are all based in the same way…
 */
export class BuildingRow implements Equatable, Serializable {
  private readonly _y: number;
  private readonly _xCurrent: number; // current x position in processing the row
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _cells: Array<BuildingCell>;
  private readonly _downwardGrowingCells: Array<BuildingCell>;

  public static of(
    y: number,
    width: number,
    height: number,
    element: Element,
    cells: Array<BuildingCell> = [],
    growing: Array<BuildingCell> = [],
    xCurrent: number = 0
  ): BuildingRow {
    return new BuildingRow(y, width, height, element, cells, growing, xCurrent);
  }

  private constructor(
    y: number,
    width: number,
    height: number,
    element: Element,
    cells: Array<BuildingCell>,
    growing: Array<BuildingCell>,
    xCurrent: number
  ) {
    this._y = y;
    this._xCurrent = xCurrent;
    this._width = width;
    this._height = height;
    this._element = element;
    this._cells = cells;
    this._downwardGrowingCells = growing;
  }

  private _update(update: {
    y?: number;
    xCurrent?: number;
    width?: number;
    height?: number;
    element?: Element;
    cells?: Array<BuildingCell>;
    downwardGrowingCells?: Array<BuildingCell>;
  }): BuildingRow {
    return BuildingRow.of(
      update.y !== undefined ? update.y : this._y,
      update.width !== undefined ? update.width : this._width,
      update.height !== undefined ? update.height : this._height,
      update.element !== undefined ? update.element : this._element,
      update.cells !== undefined ? update.cells : this._cells,
      update.downwardGrowingCells !== undefined
        ? update.downwardGrowingCells
        : this._downwardGrowingCells,
      update.xCurrent !== undefined ? update.xCurrent : this._xCurrent
    );
  }

  public get anchor(): { y: number } {
    return { y: this._y };
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get element(): Element {
    return this._element;
  }

  public get cells(): Iterable<BuildingCell> {
    return this._cells;
  }

  public get downwardGrowingCells(): Iterable<BuildingCell> {
    return this._downwardGrowingCells;
  }

  private _growCells(y: number): BuildingRow {
    return this._update({
      downwardGrowingCells: this._downwardGrowingCells.map((cell) =>
        cell.growDownward(y)
      ),
    });
  }

  private _addNonGrowingCell(cell: BuildingCell): BuildingRow {
    return this._update({ cells: this._cells.concat(cell) });
  }

  private _addGrowingCell(cell: BuildingCell): BuildingRow {
    return this._update({
      downwardGrowingCells: this._downwardGrowingCells.concat(cell),
    });
  }

  private _addCell(cell: BuildingCell): BuildingRow {
    return cell.downwardGrowing
      ? this._addGrowingCell(cell)
      : this._addNonGrowingCell(cell);
  }

  private _addCellFromElement(
    currentCell: Element,
    yCurrent: number
  ): Result<BuildingRow, string> {
    // 8, 9, 10, 13
    return BuildingCell.from(currentCell, this._xCurrent, yCurrent).andThen(
      (cell) =>
        Ok.of(
          this
            // 11
            ._adjustWidth(this._xCurrent + cell.width)
            // 12
            ._adjustHeight(cell.height)
            // 13
            // Double coverage check made at the end of table building to de-entangle code
            // 14
            ._addCell(cell)
        )
    );
  }

  private _adjustWidth(width: number): BuildingRow {
    return this._update({ width: Math.max(this._width, width) });
  }

  private _adjustHeight(height: number): BuildingRow {
    return this._update({ height: Math.max(this._height, height) });
  }

  /**
   * moves xCurrent to the first slot which is not already covered by one of the cells from the row or its context
   * step 6
   */
  private _skipIfCovered(
    cells: Array<BuildingCell>,
    yCurrent: number
  ): BuildingRow {
    if (
      this._xCurrent < this._width &&
      cells
        .concat(this._cells, this._downwardGrowingCells)
        .some((cell) => cell.isCovering(this._xCurrent, yCurrent))
    ) {
      return this._update({ xCurrent: this._xCurrent + 1 })._skipIfCovered(
        cells,
        yCurrent
      );
    } else {
      return this;
    }
  }

  private _enlargeIfNeeded(): BuildingRow {
    return this._xCurrent === this.width
      ? this._adjustWidth(this.width + 1)
      : this;
  }

  /**
   * @see/ https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
   */
  public static from(
    tr: Element,
    cells: Array<BuildingCell> = [],
    growingCells: Array<BuildingCell> = [],
    yCurrent: number = 0,
    w: number = 0
  ): Result<BuildingRow, string> {
    if (
      cells.some((cell) =>
        growingCells.some((growingCell) => cell.equals(growingCell))
      )
    )
      return Err.of("Cells and growing cells must be disjoints");
    if (tr.name !== "tr") return Err.of("This element is not a table row");

    let children = tr.children().filter(isElementByName("th", "td"));

    // 1
    // global table height adjusted after building row

    // loop control between 4-5, and 16-17-18
    return Ok.of(
      children.reduce(
        (row, currentCell) =>
          row
            // 6 (Cells)
            ._skipIfCovered(cells, yCurrent)
            // 7
            ._enlargeIfNeeded()
            // 8-14
            ._addCellFromElement(currentCell, yCurrent)
            .get(), // can't be an error because children have been filtered
        // 15 is actually not needed because it will be done as part of step 6 on next loop, and is useless on last element.
        // 2 is done when creating the row, default value for xCurrent is 0.
        BuildingRow.of(yCurrent, w, 1, tr, [], growingCells)
          // 3
          ._growCells(yCurrent)
      )
    );

    // return row;
    // 4 and 16 done after the calls to avoid side effects.
  }

  public equals(value: unknown): value is this {
    if (!(value instanceof BuildingRow)) return false;
    const sortedThisCells = this._cells.sort((a, b) => a.compare(b));
    const sortedValueCells = value._cells.sort((a, b) => a.compare(b));
    const sortedThisDGCells = this._downwardGrowingCells.sort((a, b) =>
      a.compare(b)
    );
    const sortedValueDGCells = value._downwardGrowingCells.sort((a, b) =>
      a.compare(b)
    );
    return (
      this._width === value._width &&
      this._height === value._height &&
      this._y === value._y &&
      this._element.equals(value._element) &&
      this._cells.length === value._cells.length &&
      sortedThisCells.every((cell, idx) =>
        cell.equals(sortedValueCells[idx])
      ) &&
      this._downwardGrowingCells.length ===
        value._downwardGrowingCells.length &&
      sortedThisDGCells.every((cell, idx) =>
        cell.equals(sortedValueDGCells[idx])
      )
    );
  }

  public toJSON(): BuildingRow.JSON {
    return {
      anchor: this.anchor,
      width: this._width,
      height: this._height,
      element: this._element.toJSON(),
      cells: this._cells.map((cell) => cell.cell.toJSON()),
      downwardGrowingCells: this._downwardGrowingCells.map((cell) =>
        cell.cell.toJSON()
      ),
    };
  }
}

export namespace BuildingRow {
  export interface JSON {
    [key: string]: json.JSON;
    anchor: { y: number };
    width: number;
    height: number;
    element: Element.JSON;
    cells: Cell.JSON[];
    downwardGrowingCells: Cell.JSON[];
  }
}
