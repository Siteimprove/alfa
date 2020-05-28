import { Comparable } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Cell } from "./cell";
import { isHtmlElementWithName } from "./helpers";

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
  export class Builder implements Equatable, Serializable {
    public static of(
      y: number,
      width: number,
      height: number,
      element: Element,
      cells: Iterable<Cell.Builder> = List.empty(),
      growing: Iterable<Cell.Builder> = List.empty(),
      xCurrent: number = 0
    ): Builder {
      return new Builder(y, width, height, element, cells, growing, xCurrent);
    }

    private readonly _y: number;
    private readonly _xCurrent: number; // current x position in processing the row
    private readonly _width: number;
    private readonly _height: number;
    private readonly _element: Element;
    private readonly _cells: List<Cell.Builder>;
    private readonly _downwardGrowingCells: List<Cell.Builder>;

    private constructor(
      y: number,
      width: number,
      height: number,
      element: Element,
      cells: Iterable<Cell.Builder>,
      growing: Iterable<Cell.Builder>,
      xCurrent: number
    ) {
      this._y = y;
      this._xCurrent = xCurrent;
      this._width = width;
      this._height = height;
      this._element = element;
      this._cells = List.from(cells);
      this._downwardGrowingCells = List.from(growing);
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

    public update(update: {
      y?: number;
      xCurrent?: number;
      width?: number;
      height?: number;
      element?: Element;
      cells?: Iterable<Cell.Builder>;
      downwardGrowingCells?: Iterable<Cell.Builder>;
    }): Builder {
      return Builder.of(
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

    public growCells(y: number): Builder {
      return this.update({
        downwardGrowingCells: this._downwardGrowingCells.map((cell) =>
          cell.growDownward(y)
        ),
      });
    }

    public addNonGrowingCell(cell: Cell.Builder): Builder {
      return this.update({ cells: this._cells.append(cell) });
    }

    public addGrowingCell(cell: Cell.Builder): Builder {
      return this.update({
        downwardGrowingCells: this._downwardGrowingCells.append(cell),
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
          this.update({
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
      return this.update({ width: Math.max(this._width, width) });
    }

    public adjustHeight(height: number): Builder {
      return this.update({ height: Math.max(this._height, height) });
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
        return this.update({ xCurrent: this._xCurrent + 1 }).skipIfCovered(
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
      return this.update({
        cells: List.from([...this._cells].sort(compare)),
        downwardGrowingCells: List.from(
          [...this._downwardGrowingCells].sort(compare)
        ),
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
