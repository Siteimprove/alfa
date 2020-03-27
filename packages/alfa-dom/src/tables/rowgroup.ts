import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import { Element } from "..";
import { BuildingCell, Cell, ColGroup, BuildingRow } from "./groups";
import { isElementByName } from "./helpers";

/**
 * @see/ https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
 * This is a row group as part of the table. It shouldn't duplicate width and cells list.
 */
export class RowGroup implements Equatable, Serializable {
  protected readonly _anchorY: number;
  protected readonly _height: number;
  protected readonly _element: Element;

  public static of(y: number, h: number, element: Element): RowGroup {
    return new RowGroup(y, h, element);
  }

  protected constructor(y: number, h: number, element: Element) {
    this._anchorY = y;
    this._height = h;
    this._element = element;
  }

  public get anchor(): { y: number } {
    return { y: this._anchorY };
  }
  public get height(): number {
    return this._height;
  }
  public get element(): Element {
    return this._element;
  }

  public isCovering(x: number, y: number): boolean {
    return !(
      // rowgroup is *not* covering if either
      (y < this._anchorY || this._anchorY + this._height - 1 < y) // slot is above rowgroup // slot is below rowgroup
    );
  }

  /**
   * compare rowgroups according to their anchor
   * in a given group of rowgroups (table), no two different rowgroups can have the same anchor, so this is good.
   */
  public compare(rowgroup: RowGroup): number {
    if (this._anchorY < rowgroup._anchorY) return -1;
    if (this._anchorY > rowgroup._anchorY) return 1;
    return 0;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof RowGroup &&
      this._height === value._height &&
      this._anchorY === value._anchorY &&
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
}

// This is a row group while building the table. It contains width and cells list that will be merged with parent table once done.
export class BuildingRowGroup implements Equatable, Serializable {
  private readonly _width: number;
  private readonly _cells: Array<BuildingCell>;
  private readonly _rowgroup: RowGroup;

  public static of(
    y: number,
    h: number,
    element: Element,
    w: number = 0,
    cells: Array<BuildingCell> = []
  ): BuildingRowGroup {
    return new BuildingRowGroup(y, h, element, w, cells);
  }

  constructor(
    y: number,
    h: number,
    element: Element,
    w: number,
    cells: Array<BuildingCell>
  ) {
    this._rowgroup = RowGroup.of(y, h, element);
    this._width = w;
    this._cells = cells;
  }

  private _update(update: {
    y?: number;
    w?: number;
    h?: number;
    element?: Element;
    cells?: Array<BuildingCell>;
  }): BuildingRowGroup {
    return BuildingRowGroup.of(
      update.y !== undefined ? update.y : this._rowgroup.anchor.y,
      update.h !== undefined ? update.h : this._rowgroup.height,
      update.element !== undefined ? update.element : this._rowgroup.element,
      update.w !== undefined ? update.w : this._width,
      update.cells !== undefined ? update.cells : this._cells
    );
  }

  public get rowgroup(): RowGroup {
    return this._rowgroup;
  }
  public get width(): number {
    return this._width;
  }
  public get cells(): Iterable<BuildingCell> {
    return this._cells;
  }
  public get anchor(): { y: number } {
    return { y: this._rowgroup.anchor.y };
  }
  public get height(): number {
    return this._rowgroup.height;
  }
  public get element(): Element {
    return this._rowgroup.element;
  }

  private _adjustWidth(w: number): BuildingRowGroup {
    return this._update({ w: Math.max(this._width, w) });
  }
  private _adjustHeight(h: number): BuildingRowGroup {
    return this._update({ h: Math.max(this.height, h) });
  }

  // anchoring a row group needs to move all cells accordingly
  public anchorAt(y: number): BuildingRowGroup {
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
  public static from(group: Element): Result<BuildingRowGroup, string> {
    if (
      group.name !== "tfoot" &&
      group.name !== "tbody" &&
      group.name !== "thead"
    )
      return Err.of("This element is not a row group");

    let growingCellsList: Array<BuildingCell> = [];
    let rowgroup = BuildingRowGroup.of(-1, 0, group);
    let yCurrent = 0; // y position inside the rowgroup
    // 1
    // Useless, the height of the group is computed and used instead.
    // 2
    for (const tr of group.children().filter(isElementByName("tr"))) {
      const row = BuildingRow.from(
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
    if (!(value instanceof BuildingRowGroup)) return false;
    const sortedThisCells = this._cells.sort((a, b) => a.compare(b));
    const sortedValueCells = value._cells.sort((a, b) => a.compare(b));
    return (
      this._rowgroup.equals(value._rowgroup) &&
      this._width === value._width &&
      sortedThisCells.length === sortedValueCells.length &&
      sortedThisCells.every((cell, idx) => cell.equals(sortedValueCells[idx]))
    );
  }

  public toJSON(): BuildingRowGroup.JSON {
    return {
      rowgroup: this._rowgroup.toJSON(),
      width: this._width,
      cells: this._cells.map((cell) => cell.cell.toJSON()),
    };
  }
}

export namespace BuildingRowGroup {
  export interface JSON {
    [key: string]: json.JSON;
    rowgroup: RowGroup.JSON;
    width: number;
    cells: Cell.JSON[];
  }
}
