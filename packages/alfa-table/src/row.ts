import { Comparable } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Cell } from "./cell";
import { ColumnGroup } from "./column-group";
import { isHtmlElementWithName } from "./helpers";
import { RowGroup } from "./row-group";
// import { Builder } from "./table";

const { compare } = Comparable;
const { some } = Iterable;

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
export namespace Row {
  import concat = Iterable.concat;

  export class Builder implements Equatable, Serializable {
    public static of(
      y: number,
      width: number,
      height: number,
      element: Element,
      cells: Iterable<Cell.Builder> = List.empty(),
      growing: Iterable<Cell.Builder> = List.empty(),
      xCurrent: number = 0,
      slots: Array<Array<Option<Cell.Builder>>> = [[]]
    ): Builder {
      return new Builder(
        y,
        width,
        height,
        element,
        cells,
        growing,
        xCurrent,
        slots
      );
    }

    private readonly _y: number;
    private readonly _xCurrent: number; // current x position in processing the row
    private readonly _width: number;
    private readonly _height: number;
    private readonly _element: Element;
    private readonly _cells: List<Cell.Builder>;
    private readonly _downwardGrowingCells: List<Cell.Builder>;
    // Cell covering a given slot, either from this._cells or this._downwardGrowingCells
    private readonly _slots: Array<Array<Option<Cell.Builder>>>;

    private constructor(
      y: number,
      width: number,
      height: number,
      element: Element,
      cells: Iterable<Cell.Builder>,
      growing: Iterable<Cell.Builder>,
      xCurrent: number,
      slots: Array<Array<Option<Cell.Builder>>>
    ) {
      this._y = y;
      this._xCurrent = xCurrent;
      this._width = width;
      this._height = height;
      this._element = element;
      this._cells = List.from(cells);
      this._downwardGrowingCells = List.from(growing);
      this._slots = slots;
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

    public get cells(): Iterable<Cell.Builder> {
      return this._cells;
    }

    public get downwardGrowingCells(): Iterable<Cell.Builder> {
      return this._downwardGrowingCells;
    }

    public slot(x: number, y: number): Option<Cell.Builder> {
      return this._slots?.[x]?.[y] === undefined ? None : this._slots[x][y];
    }

    /**
     * Update by getting new values. Does not keep slots in sync, hence is highly unsafe. Use at your own risks.
     */
    private _updateUnsafe({
      y = this._y,
      xCurrent = this._xCurrent,
      width = this._width,
      height = this._height,
      element = this._element,
      cells = this._cells,
      downwardGrowingCells = this._downwardGrowingCells,
      slots = this._slots,
    }: {
      y?: number;
      xCurrent?: number;
      width?: number;
      height?: number;
      element?: Element;
      cells?: Iterable<Cell.Builder>;
      downwardGrowingCells?: Iterable<Cell.Builder>;
      slots?: Array<Array<Option<Cell.Builder>>>;
    }): Builder {
      return Builder.of(
        y,
        width,
        height,
        element,
        cells,
        downwardGrowingCells,
        xCurrent,
        slots
      );
    }

    /**
     * Update anything but cells/downward growing cells, because these need to be kept in sync with slots.
     */
    private _update(update: {
      y?: number;
      xCurrent?: number;
      width?: number;
      height?: number;
      element?: Element;
      slots?: Array<Array<Option<Cell.Builder>>>;
    }): Builder {
      return this._updateUnsafe(update);
    }

    /**
     * Update cells, and resync slots
     */
    private _updateCells({
      cells = List.empty(),
      downwardGrowingCells = List.empty(),
    }: {
      cells?: Iterable<Cell.Builder>;
      downwardGrowingCells?: Iterable<Cell.Builder>;
    }): Builder {
      return this._updateUnsafe({ cells, downwardGrowingCells })._updateSlots(
        concat(cells, downwardGrowingCells)
      );
    }

    /**
     * Add new cells, and sync slots with the new cells.
     */
    private _addCells({
      cells = List.empty(),
      downwardGrowingCells = List.empty(),
    }: {
      cells?: Iterable<Cell.Builder>;
      downwardGrowingCells?: Iterable<Cell.Builder>;
    }): Builder {
      return this._updateUnsafe({
        cells: this._cells.concat(cells),
        downwardGrowingCells: this._downwardGrowingCells.concat(
          downwardGrowingCells
        ),
      })._updateSlots(concat(cells, downwardGrowingCells));
    }

    private _updateSlots(cells: Iterable<Cell.Builder>): Builder {
      for (const cell of cells) {
        for (let x = cell.anchor.x; x < cell.anchor.x + cell.width; x++) {
          if (this._slots[x] === undefined) {
            this._slots[x] = [];
          }
          for (let y = cell.anchor.y; y < cell.anchor.y + cell.height; y++) {
            this._slots[x][y] = Some.of(cell);
          }
        }
      }

      return this; // for chaining
    }

    public growCells(y: number): Builder {
      return this._updateCells({
        downwardGrowingCells: this._downwardGrowingCells.map((cell) =>
          cell.growDownward(y)
        ),
      });
    }

    // TODO make private ×n (or remove)
    public addNonGrowingCell(cell: Cell.Builder): Builder {
      return this._addCells({ cells: [cell] });
    }

    public addGrowingCell(cell: Cell.Builder): Builder {
      return this._addCells({
        downwardGrowingCells: [cell],
      });
    }

    public addCell(cell: Cell.Builder): Builder {
      return cell.downwardGrowing
        ? this.addGrowingCell(cell)
        : this.addNonGrowingCell(cell);
    }

    public addCellFromElement(
      currentCell: Element,
      yCurrent: number
    ): Result<Builder, string> {
      // 8, 9, 10, 13
      return Cell.Builder.from(currentCell, this._xCurrent, yCurrent).map(
        (cell) =>
          this._update({
            // 11
            width: Math.max(this.width, this._xCurrent + cell.width),
            // 12
            height: Math.max(this.height, cell.height),
          })
            // 14
            .addCell(cell)
      );
      // 13
      // Double coverage check made at the end of table building to de-entangle code
    }

    public adjustWidth(width: number): Builder {
      return this._update({ width: Math.max(this._width, width) });
    }

    public adjustHeight(height: number): Builder {
      return this._update({ height: Math.max(this._height, height) });
    }

    /**
     * moves xCurrent to the first slot which is not already covered by one of the cells from the row or its context
     * step 6
     */
    public skipIfCovered(cells: List<Cell.Builder>, yCurrent: number): Builder {
      if (
        this._xCurrent < this._width &&
        cells
          .concat(this._cells)
          .concat(this._downwardGrowingCells)
          .some((cell) => cell.isCovering(this._xCurrent, yCurrent))
      ) {
        return this._update({ xCurrent: this._xCurrent + 1 }).skipIfCovered(
          cells,
          yCurrent
        );
      } else {
        return this;
      }
    }

    public enlargeIfNeeded(): Builder {
      return this._xCurrent === this.width
        ? this.adjustWidth(this.width + 1)
        : this;
    }

    public sort(): Builder {
      return this._updateCells({
        cells: [...this._cells].sort(compare),
        downwardGrowingCells: [...this._downwardGrowingCells].sort(compare),
      });
    }

    public equals(value: unknown): value is this {
      if (!(value instanceof Builder)) return false;
      return (
        this._width === value._width &&
        this._height === value._height &&
        this._y === value._y &&
        this._element.equals(value._element) &&
        this._cells.equals(value._cells) &&
        this._downwardGrowingCells.equals(value._downwardGrowingCells)
      );
    }

    public toJSON(): Builder.JSON {
      return {
        anchor: this.anchor,
        width: this._width,
        height: this._height,
        element: this._element.toJSON(),
        cells: this._cells.toArray().map((cell) => cell.cell.toJSON()),
        downwardGrowingCells: this._downwardGrowingCells
          .toArray()
          .map((cell) => cell.cell.toJSON()),
      };
    }
  }

  export namespace Builder {
    /**
     * @see/ https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
     */
    export function from(
      tr: Element,
      cells: Iterable<Cell.Builder> = List.empty(),
      growingCells: Iterable<Cell.Builder> = List.empty(),
      yCurrent: number = 0,
      w: number = 0
    ): Result<Builder, string> {
      if (tr.name !== "tr") {
        return Err.of("This element is not a table row");
      }

      if (
        some(cells, (cell) =>
          some(growingCells, (growingCell) => cell.equals(growingCell))
        )
      ) {
        return Err.of("Cells and growing cells must be disjoints");
      }

      const children = tr.children().filter(isHtmlElementWithName("th", "td"));

      // 1
      // global table height adjusted after building row

      // loop control between 4-5, and 16-17-18
      return Ok.of(
        children.reduce(
          (row, currentCell) =>
            row
              // 6 (Cells)
              .skipIfCovered(List.from(cells), yCurrent)
              // 7
              .enlargeIfNeeded()
              // 8-14
              .addCellFromElement(currentCell, yCurrent)
              .get(), // can't be an error because children have been filtered
          // 15 is actually not needed because it will be done as part of step 6 on next loop, and is useless on last element.
          // 2 is done when creating the row, default value for xCurrent is 0.
          Builder.of(yCurrent, w, 1, tr, List.empty(), growingCells)
            // 3
            .growCells(yCurrent)
            .sort()
        )
      );

      // return row;
      // 4 and 16 done after the calls to avoid side effects.
    }

    export interface JSON {
      [key: string]: json.JSON;
      anchor: {
        y: number;
      };
      width: number;
      height: number;
      element: Element.JSON;
      cells: Cell.JSON[];
      downwardGrowingCells: Cell.JSON[];
    }
  }
}
