import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Element } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Cell } from "./cell";
import { isHtmlElementWithName } from "./helpers";
import { Row } from "./row";

const { compare } = Comparable;

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
 * This is a row group as part of the table. Width and cells list are stored in the table, not here.
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
    if (this._y < rowgroup._y) {
      return Comparison.Less;
    }

    if (this._y > rowgroup._y) {
      return Comparison.Greater;
    }

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
  export function from(element: Element): Result<RowGroup, string> {
    return RowGroup.Builder.from(element).map((rowgroup) => rowgroup.rowgroup);
  }

  export interface JSON {
    [key: string]: json.JSON;
    anchor: {
      y: number;
    };
    height: number;
    element: Element.JSON;
  }

  /**
   * The row group builder contains width and cells list that will be merged with parent table once done.
   */
  export class Builder implements Equatable, Serializable {
    private readonly _width: number;
    private readonly _cells: Array<Cell.Builder>;
    private readonly _rowgroup: RowGroup;

    public static of(
      y: number,
      height: number,
      element: Element,
      width: number = 0,
      cells: Array<Cell.Builder> = []
    ): Builder {
      return new Builder(y, height, element, width, cells);
    }

    constructor(
      y: number,
      height: number,
      element: Element,
      width: number,
      cells: Array<Cell.Builder>
    ) {
      this._rowgroup = RowGroup.of(y, height, element);
      this._width = width;
      this._cells = cells;
    }

    public update(update: {
      y?: number;
      width?: number;
      height?: number;
      element?: Element;
      cells?: Array<Cell.Builder>;
    }): Builder {
      return Builder.of(
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

    public get cells(): Array<Cell.Builder> {
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

    // anchoring a row group needs to move down all cells accordingly
    public anchorAt(y: number): Builder {
      return this.update({
        y,
        cells: this._cells.map((cell) =>
          cell.anchorAt(cell.anchor.x, y + cell.anchor.y)
        ),
      });
    }

    public equals(value: unknown): value is this {
      if (!(value instanceof Builder)) return false;
      return (
        this._rowgroup.equals(value._rowgroup) &&
        this._width === value._width &&
        this._cells.length === value._cells.length &&
        this._cells.every((cell, idx) => cell.equals(value._cells[idx]))
      );
    }

    public toJSON(): Builder.JSON {
      return {
        rowgroup: this._rowgroup.toJSON(),
        width: this._width,
        cells: this._cells.map((cell) => cell.cell.toJSON()),
      };
    }
  }

  export namespace Builder {
    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
     */
    export function from(group: Element): Result<Builder, string> {
      if (
        group.name !== "tfoot" &&
        group.name !== "tbody" &&
        group.name !== "thead"
      ) {
        return Err.of("This element is not a row group");
      }

      let growingCellsList: Array<Cell.Builder> = [];
      let rowgroup = Builder.of(-1, 0, group);
      let yCurrent = 0; // y position inside the rowgroup
      // 1
      // Useless, the height of the group is computed and used instead.
      // 2
      for (const tr of group.children().filter(isHtmlElementWithName("tr"))) {
        const row = Row.Builder.from(
          tr,
          rowgroup.cells,
          growingCellsList,
          yCurrent,
          rowgroup.width
        ).get();
        growingCellsList = [...row.downwardGrowingCells];
        rowgroup = rowgroup.update({
          cells: rowgroup.cells.concat(...row.cells),
          height: Math.max(rowgroup.height, yCurrent + row.height),
          width: Math.max(rowgroup.width, row.width),
        });
        // row processing steps 4/16
        yCurrent++;
      }
      // 4, ending the row group
      // ending row group 1
      growingCellsList = growingCellsList.map((cell) =>
        cell.growDownward(rowgroup.rowgroup.height - 1)
      );
      // ending row group 2
      // When emptying the growing cells list, we need to finally add them to the group.
      rowgroup = rowgroup.update({
        cells: rowgroup.cells.concat(growingCellsList),
      });
      // 3, returning the row group for the table to handle
      // we could check here if height>0 and return an option, to be closer to the algorithm but that would be less uniform.
      return Ok.of(rowgroup.update({ cells: rowgroup.cells.sort(compare) }));
    }

    export interface JSON {
      [key: string]: json.JSON;

      rowgroup: RowGroup.JSON;
      width: number;
      cells: Cell.JSON[];
    }
  }
}
