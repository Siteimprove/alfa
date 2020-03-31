import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Equatable } from "@siteimprove/alfa-equatable";
import * as json from "@siteimprove/alfa-json";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import { Element } from "..";
import { Row, Cell } from "./groups";
import { isElementByName } from "./helpers";

/**
 * @see/ https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
 * This is a row group as part of the table. It shouldn't duplicate width and cells list.
 */
export class RowGroup implements Comparable<RowGroup>, Equatable, Serializable {
  protected readonly _y: number;
  protected readonly _height: number;
  protected readonly _element: Element;

  public static of(y: number, h: number, element: Element): RowGroup {
    return new RowGroup(y, h, element);
  }

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

  public static from(element: Element): Result<RowGroup, string> {
    return RowGroup.Building.from(element).map((rowgroup) => rowgroup.rowgroup);
  }

  public isCovering(y: number): boolean {
    return !(
      // rowgroup is *not* covering if either
      (y < this._y || this._y + this._height - 1 < y) // slot is above rowgroup // slot is below rowgroup
    );
  }

  /**
   * compare rowgroups according to their anchor
   * in a given group of rowgroups (table), no two different rowgroups can have the same anchor, so this is good.
   */
  public compare(rowgroup: RowGroup): Comparison {
    if (this._y < rowgroup._y) return Comparison.Smaller;
    if (this._y > rowgroup._y) return Comparison.Greater;
    return Comparison.Equal;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof RowGroup &&
      this._height === value._height &&
      this._y === value._y &&
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

    anchor: { y: number };
    height: number;
    element: Element.JSON;
  }

  // This is a row group while building the table. It contains width and cells list that will be merged with parent table once done.
  export class Building implements Equatable, Serializable {
    private readonly _width: number;
    private readonly _cells: Array<Cell.Building>;
    private readonly _rowgroup: RowGroup;

    public static of(
      y: number,
      height: number,
      element: Element,
      width: number = 0,
      cells: Array<Cell.Building> = []
    ): Building {
      return new Building(y, height, element, width, cells);
    }

    constructor(
      y: number,
      height: number,
      element: Element,
      width: number,
      cells: Array<Cell.Building>
    ) {
      this._rowgroup = RowGroup.of(y, height, element);
      this._width = width;
      this._cells = cells;
    }

    private _update(update: {
      y?: number;
      width?: number;
      height?: number;
      element?: Element;
      cells?: Array<Cell.Building>;
    }): Building {
      return Building.of(
        update.y !== undefined ? update.y : this._rowgroup.anchor.y,
        update.height !== undefined ? update.height : this._rowgroup.height,
        update.element !== undefined ? update.element : this._rowgroup.element,
        update.width !== undefined ? update.width : this._width,
        update.cells !== undefined ? update.cells : this._cells
      );
    }

    public get rowgroup(): RowGroup {
      return this._rowgroup;
    }

    public get width(): number {
      return this._width;
    }

    public get cells(): Iterable<Cell.Building> {
      return this._cells;
    }

    public get anchor(): { y: number } {
      return this._rowgroup.anchor;
    }

    public get height(): number {
      return this._rowgroup.height;
    }

    public get element(): Element {
      return this._rowgroup.element;
    }

    private _adjustWidth(width: number): Building {
      return this._update({ width: Math.max(this._width, width) });
    }

    private _adjustHeight(height: number): Building {
      return this._update({ height: Math.max(this.height, height) });
    }

    // anchoring a row group needs to move all cells accordingly
    public anchorAt(y: number): Building {
      return this._update({
        y,
        cells: this._cells.map((cell) =>
          cell.anchorAt(cell.anchor.x, y + cell.anchor.y)
        ),
      });
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
     */
    public static from(group: Element): Result<Building, string> {
      if (
        group.name !== "tfoot" &&
        group.name !== "tbody" &&
        group.name !== "thead"
      )
        return Err.of("This element is not a row group");

      let growingCellsList: Array<Cell.Building> = [];
      let rowgroup = Building.of(-1, 0, group);
      let yCurrent = 0; // y position inside the rowgroup
      // 1
      // Useless, the height of the group is computed and used instead.
      // 2
      for (const tr of group.children().filter(isElementByName("tr"))) {
        const row = Row.Building.from(
          tr,
          rowgroup._cells,
          growingCellsList,
          yCurrent,
          rowgroup._width
        ).get();
        growingCellsList = [...row.downwardGrowingCells];
        rowgroup = rowgroup
          ._update({ cells: rowgroup._cells.concat(...row.cells) })
          ._adjustHeight(yCurrent + row.height)
          ._adjustWidth(row.width);
        // row processing steps 4/16
        yCurrent++;
      }
      // 4, ending the row group
      // ending row group 1
      growingCellsList = growingCellsList.map((cell) =>
        cell.growDownward(rowgroup._rowgroup.height - 1)
      );
      // ending row group 2
      // When emptying the growing cells list, we need to finally add them to the group.
      rowgroup = rowgroup._update({
        cells: rowgroup._cells.concat(growingCellsList),
      });
      // 3, returning the row group for the table to handle
      // we could check here if height>0 and return an option, to be closer to the algorithm but that would be less uniform.
      return Ok.of(rowgroup);
    }

    public equals(value: unknown): value is this {
      if (!(value instanceof Building)) return false;
      const sortedThisCells = this._cells.sort((a, b) => a.compare(b));
      const sortedValueCells = value._cells.sort((a, b) => a.compare(b));
      return (
        this._rowgroup.equals(value._rowgroup) &&
        this._width === value._width &&
        sortedThisCells.length === sortedValueCells.length &&
        sortedThisCells.every((cell, idx) => cell.equals(sortedValueCells[idx]))
      );
    }

    public toJSON(): Building.JSON {
      return {
        rowgroup: this._rowgroup.toJSON(),
        width: this._width,
        cells: this._cells.map((cell) => cell.cell.toJSON()),
      };
    }
  }

  export namespace Building {
    export interface JSON {
      [key: string]: json.JSON;

      rowgroup: RowGroup.JSON;
      width: number;
      cells: Cell.JSON[];
    }
  }
}
