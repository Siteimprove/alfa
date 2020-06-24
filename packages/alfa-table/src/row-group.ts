import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Cell } from "./cell";
import { isHtmlElementWithName } from "./helpers";
import { Row } from "./row";

const { compare } = Comparable;
const { concat, map } = Iterable;

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
 */
export class RowGroup implements Comparable<RowGroup>, Equatable, Serializable {
  public static of(y: number, h: number, element: Element): RowGroup {
    return new RowGroup(y, h, element);
  }

  protected readonly _y: number;
  protected readonly _height: number;
  protected readonly _element: Element;

  protected constructor(y: number, h: number, element: Element) {
    this._y = y;
    this._height = h;
    this._element = element;
  }

  public get anchor(): { y: number } {
    return { y: this._y };
  }

  public get height(): number {
    return this._height;
  }

  public get element(): Element {
    return this._element;
  }

  public isCovering(y: number): boolean {
    // A row group is *not* covering the row (y) if either:
    // - the row is above the row group; or
    // - the row is below the row group.
    return !(y < this._y || this._y + this._height - 1 < y);
  }

  /**
   * Compare this row group to another according to their anchors.
   *
   * @remarks
   * In a given group of row groups (tables), no two row groups will have the
   * same anchor.
   */
  public compare(that: RowGroup): Comparison {
    if (this._y < that._y) {
      return Comparison.Less;
    }

    if (this._y > that._y) {
      return Comparison.Greater;
    }

    return Comparison.Equal;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof RowGroup &&
      this._y === value._y &&
      this._height === value._height &&
      this._element.equals(value._element)
    );
  }

  public toJSON(): RowGroup.JSON {
    return {
      anchor: this.anchor,
      height: this._height,
      element: this._element.toJSON(),
    };
  }
}

export namespace RowGroup {
  export interface JSON {
    [key: string]: json.JSON;
    anchor: {
      y: number;
    };
    height: number;
    element: Element.JSON;
  }

  export function from(element: Element): Result<RowGroup, string> {
    return RowGroup.Builder.from(element).map((rowgroup) => rowgroup.rowgroup);
  }

  /**
   * The row group builder contains width and cells list that will be merged with parent table once done.
   */
  export class Builder implements Equatable, Serializable {
    public static of(
      y: number,
      height: number,
      element: Element,
      width: number = 0,
      cells: Iterable<Cell.Builder> = List.empty(),
      downwardGrowingCells: Iterable<Cell.Builder> = List.empty(),
      slots: Array<Array<Option<Cell.Builder>>> = [[]]
    ): Builder {
      return new Builder(
        y,
        height,
        element,
        width,
        cells,
        downwardGrowingCells,
        slots
      );
    }

    private readonly _width: number;
    private readonly _cells: List<Cell.Builder>;
    private readonly _downwardGrowingCells: List<Cell.Builder>;
    private readonly _rowGroup: RowGroup;
    // Cell covering a given slot, either from this._cells or this._downwardGrowingCells
    private readonly _slots: Array<Array<Option<Cell.Builder>>>;

    constructor(
      y: number,
      height: number,
      element: Element,
      width: number,
      cells: Iterable<Cell.Builder>,
      downwardGrowingCells: Iterable<Cell.Builder>,
      slots: Array<Array<Option<Cell.Builder>>>
    ) {
      this._rowGroup = RowGroup.of(y, height, element);
      this._width = width;
      this._cells = List.from(cells);
      this._downwardGrowingCells = List.from(downwardGrowingCells);
      this._slots = slots;
    }

    public get rowgroup(): RowGroup {
      return this._rowGroup;
    }

    public get width(): number {
      return this._width;
    }

    public get cells(): Iterable<Cell.Builder> {
      return this._cells;
    }

    public get downwardGrowingCells(): Iterable<Cell.Builder> {
      return this._downwardGrowingCells;
    }

    public get anchor(): { y: number } {
      return this._rowGroup.anchor;
    }

    public get height(): number {
      return this._rowGroup.height;
    }

    public get element(): Element {
      return this._rowGroup.element;
    }

    public slot(x: number, y: number): Option<Cell.Builder> {
      return this._slots?.[x]?.[y] === undefined ? None : this._slots[x][y];
    }

    /**
     * Update by getting new values. Does not keep slots in sync, hence is highly unsafe. Use at your own risks.
     */
    public _updateUnsafe({
      y = this._rowGroup.anchor.y,
      width = this._width,
      height = this._rowGroup.height,
      element = this._rowGroup.element,
      cells = this._cells,
      downwardGrowingCells = this._downwardGrowingCells,
      slots = this._slots,
    }: {
      y?: number;
      width?: number;
      height?: number;
      element?: Element;
      cells?: Iterable<Cell.Builder>;
      downwardGrowingCells?: Iterable<Cell.Builder>;
      slots?: Array<Array<Option<Cell.Builder>>>;
    }): Builder {
      return Builder.of(
        y,
        height,
        element,
        width,
        cells,
        downwardGrowingCells,
        slots
      );
    }

    /**
     * Update anything but cells/downward growing cells, because these need to be kept in sync with slots.
     */
    public update(update: {
      y?: number;
      width?: number;
      height?: number;
      element?: Element;
    }): Builder {
      return this._updateUnsafe(update);
    }

    /**
     * Update cells/downward growing cells, and resync slots with all (updated) cells
     */
    public updateCells({
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
     * Add new cells/downward growing cells, and sync slots with the new cells only.
     */
    public addCells({
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

    /**
     * Resync slots with a given list of cells. Caller need to ensure that all updated/added cells are passed.
     */
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

    // anchoring a row group needs to move down all cells accordingly
    public anchorAt(y: number): Builder {
      return this.updateCells({
        cells: this._cells.map((cell) =>
          cell.anchorAt(cell.anchor.x, y + cell.anchor.y)
        ),
        downwardGrowingCells: this._downwardGrowingCells.map((cell) =>
          cell.anchorAt(cell.anchor.x, y + cell.anchor.y)
        ),
      }).update({ y });
    }

    public equals(value: unknown): value is this {
      if (!(value instanceof Builder)) return false;
      return (
        this._rowGroup.equals(value._rowGroup) &&
        this._width === value._width &&
        this._cells.equals(value._cells)
      );
    }

    public toJSON(): Builder.JSON {
      return {
        rowGroup: this._rowGroup.toJSON(),
        width: this._width,
        cells: this._cells.toArray().map((cell) => cell.cell.toJSON()),
      };
    }
  }

  export namespace Builder {
    export interface JSON {
      [key: string]: json.JSON;
      rowGroup: RowGroup.JSON;
      width: number;
      cells: Cell.JSON[];
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
     */
    export function from(group: Element): Result<Builder, string> {
      if (!Element.hasName("tfoot", "tbody", "thead")(group)) {
        return Err.of("This element is not a row group");
      }

      let rowgroup = Builder.of(-1, 0, group);
      let yCurrent = 0; // y position inside the rowgroup
      // 1
      // Useless, the height of the group is computed and used instead.
      // 2
      for (const tr of group.children().filter(isHtmlElementWithName("tr"))) {
        const row = Row.Builder.from(
          tr,
          rowgroup.cells,
          rowgroup.downwardGrowingCells,
          yCurrent,
          rowgroup.width
        ).get();

        rowgroup = rowgroup
          .addCells({ cells: row.cells })
          ._updateUnsafe({ downwardGrowingCells: row.downwardGrowingCells })
          .update({
            height: Math.max(rowgroup.height, yCurrent + row.height),
            width: Math.max(rowgroup.width, row.width),
          });

        // row processing steps 4/16
        yCurrent++;
      }
      // 4, ending the row group
      // ending row group 2
      // When emptying the growing cells list, we need to finally add them to the group.
      rowgroup = rowgroup.addCells({
        cells: map(rowgroup.downwardGrowingCells, (cell) =>
          cell.growDownward(rowgroup.rowgroup.height - 1)
        ),
      });
      // 3, returning the row group for the table to handle
      // we could check here if height>0 and return an option, to be closer to the algorithm but that would be less uniform.
      return Ok.of(
        rowgroup.updateCells({ cells: [...rowgroup.cells].sort(compare) })
      );
    }
  }
}
