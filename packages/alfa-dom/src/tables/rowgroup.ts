// https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
import {Equatable} from "@siteimprove/alfa-equatable";
import {Serializable} from "@siteimprove/alfa-json";
import {Element } from "..";
import {Cell, ColGroup, Row} from "./groups";

import * as json from "@siteimprove/alfa-json";
import assert = require("assert");
import {isElementByName} from "./helpers";

// This is a row group as part of the table. It shouldn't duplicate width and cells list.
export class RowGroup implements Equatable, Serializable {
  protected readonly _anchor: {y: number};
  protected readonly _height: number;
  protected readonly _element: Element;

  protected constructor(y: number, h: number, element: Element) {
    this._anchor = { y };
    this._height = h;
    this._element = element;
  }

  public static of(y: number, h: number, element: Element) {
    return new RowGroup(y, h, element)
  }

  public get anchor() {
    return this._anchor;
  }
  public get height() {
    return this._height;
  }
  public get element() {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return true;
  }
  public isColGroup(): this is ColGroup {
    return false;
  }

  // compare rowgroups according to their anchor
  // in a given group of rowgroups (table), no two different rowgroups can have the same anchor, so this is good.
  public compare(rowgroup: RowGroup): number {
    if (this._anchor.y < rowgroup.anchor.y) return -1;
    if (this._anchor.y > rowgroup.anchor.y) return 1;
    return 0;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof RowGroup &&
      this._height === value._height &&
      this._anchor.y === value._anchor.y &&
      this._element.equals(value._element)
    )
  }

  public toJSON(): RowGroup.JSON {
    return {
      anchor: this._anchor,
      height: this._height,
      element: this._element.toJSON()
    }
  }

  public toString(): string {
    return `RowGroup anchor: ${this._anchor.y}, height: ${this._height}, element: ${this._element}`
  }
}

export namespace RowGroup {
  export interface JSON {
    [key: string]: json.JSON,
    anchor: { y: number },
    height: number,
    element: Element.JSON
  }
}

// This is a row group while building the table. It contains width and cells list that will be merged with parent table once done.
export class BuildingRowGroup extends RowGroup {
  private readonly _width: number;
  private readonly _cells: Array<Cell>;

  constructor(y: number, h: number, element: Element, w: number, cells: Array<Cell>) {
    super(y, h, element);
    this._width = w;
    this._cells = cells;
  }

  public static of(y: number, h: number, element: Element, w: number = 0, cells: Array<Cell> = []) {
    return new BuildingRowGroup(y, h, element, w, cells);
  }

  public toRowGroup(): RowGroup {
    return RowGroup.of(this._anchor.y, this._height, this._element);
  }

  private _update(update: {y?: number, width?: number, height?: number, element?: Element, cells?: Array<Cell>}): BuildingRowGroup {
    return BuildingRowGroup.of(
      update.y !== undefined ? update.y : this._anchor.y,
      update.height !== undefined ? update.height : this._height,
      update.element !== undefined ? update.element : this._element,
      update.width !== undefined ? update.width : this._width,
      update.cells !== undefined ? update.cells : this._cells,
    )
  }

  public get width() {
    return this._width;
  }
  public get cells() {
    return this._cells;
  }

  private _adjustWidth(w: number): BuildingRowGroup {
    return this._update({width: Math.max(this._width, w)})
  }
  private _adjustHeight(h: number): BuildingRowGroup {
    return this._update({height: Math.max(this._height, h)})
  }

  // anchoring a row group needs to move all cells accordingly
  public anchorAt(y: number): BuildingRowGroup {
    return this._update({
      y,
      cells: this._cells.map(cell => cell.anchorAt(cell.anchor.x, y+cell.anchor.y))
    })
  }

  // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
  public static from(group: Element): BuildingRowGroup {
    assert(group.name === "tfoot" || group.name ==="tbody" || group.name === "thead");

    let growingCellsList: Array<Cell> = [];
    let rowgroup = BuildingRowGroup.of(-1, 0, group);
    let yCurrent = 0; // y position inside the rowgroup
    // 1
    // Useless, the height of the group is computed and used instead.
    // 2
    for (const tr of group.children().filter(isElementByName("tr"))) {
      const row = Row.from(tr, rowgroup._cells, growingCellsList, yCurrent, rowgroup._width);
      growingCellsList = row.downwardGrowingCells;
      rowgroup = rowgroup
        ._update({cells: rowgroup._cells.concat(row.cells)})
        ._adjustHeight(yCurrent+row.height)
        ._adjustWidth(row.width);
      // row processing steps 4/16
      yCurrent++;
    }
    // 4, ending the row group
    // ending row group 1
    growingCellsList = growingCellsList.map(cell => cell.growDownward(rowgroup._height-1));
    // ending row group 2
    // When emptying the growing cells list, we need to finally add them to the table.
    rowgroup = rowgroup._update({cells: rowgroup._cells.concat(growingCellsList)});
    // 3, returning the row group for the table to handle
    // we could check here if height>0 and return an option, to be closer to the algorithm but that would be less uniform.
    return rowgroup;
  }

  public equals(value: unknown): value is this {
    if (!(value instanceof BuildingRowGroup)) return false;
    const sortedThisCells = this._cells.sort((a, b) => a.compare(b));
    const sortedValueCells = value._cells.sort((a, b) => a.compare(b));
    return (
      this._height === value._height &&
      this._width === value._width &&
      this._anchor.y === value._anchor.y &&
      this._element.equals(value._element) &&
      sortedThisCells.length === sortedValueCells.length &&
      sortedThisCells.every((cell, idx) => cell.equals(sortedValueCells[idx]))
    )
  }

  public toJSON(): BuildingRowGroup.JSON {
    return {
      anchor: this._anchor,
      height: this._height,
      width: this._width,
      element: this._element.toJSON(),
      cells: this._cells.map(cell => cell.toJSON())
    }
  }

  public toString(): string {
    return `RowGroup anchor: ${this._anchor.y}, height: ${this._height}, width: ${this._width}, element: ${this._element}, cells: ${this._cells}`
  }
}

export namespace BuildingRowGroup {
  export interface JSON {
    [key: string]: json.JSON,
    anchor: { y: number },
    height: number,
    width: number,
    element: Element.JSON,
    cells: Cell.JSON[]
  }
}
