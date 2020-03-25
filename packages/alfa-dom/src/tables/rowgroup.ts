// https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
import {Equatable} from "@siteimprove/alfa-equatable";
import {Serializable} from "@siteimprove/alfa-json";
import {Element, Table} from "..";
import {Cell, ColGroup, Row} from "./groups";

import * as json from "@siteimprove/alfa-json";
import assert = require("assert");
import {isElementByName} from "./helpers";

// This is a row group as part of the table. It shouldn't duplicate width and cells list.
export class RowGroup implements Equatable, Serializable {
  protected readonly _anchor: {y: number};
  protected readonly _height: number;
  protected readonly _element: Element;

  constructor(y: number, height: number, element: Element) {
    this._anchor = { y };
    this._height = height;
    this._element = element;
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

  constructor(y: number, height: number, element: Element, width: number = 0, cells: Array<Cell> = []) {
    super(y, height, element);
    this._width = width;
    this._cells = cells;
  }

  _update(update: {y?: number, width?: number, height?: number, element?: Element, cells?: Array<Cell>}): BuildingRowGroup {
    return new BuildingRowGroup(
      update.y || this._anchor.y,
      update.height || this._height,
      update.element || this._element,
      update.width || this._width,
      update.cells || this._cells,
    )
  }

  public get width() {
    return this._width;
  }
  public get cells() {
    return this._cells;
  }

  _adjustWidth(w: number): BuildingRowGroup {
    return this._update({width: Math.max(this._width, w)})
  }
  _adjustHeight(h: number): BuildingRowGroup {
    return this._update({height: Math.max(this._height, h)})
  }

  // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
  public static of(group: Element): BuildingRowGroup {
    assert(group.name === "tfoot" || group.name ==="tbody" || group.name === "thead");

    let yCurrent = 0; // y position inside the rowgroup
    let growingCellsList: Array<Cell> = [];
    let rowgroup = new BuildingRowGroup(yCurrent, 0, group);
    // 1
    // When the row group  start, yCurrent is always equal to the height of the table.
    const yStart = yCurrent;
    // 2
    for (const tr of group.children().filter(isElementByName("tr"))) {
      // const row = Row.of(tr, table.cells, growingCellsList, yCurrent, table.width);
      const row = Row.of(tr, rowgroup._cells, growingCellsList, yCurrent, rowgroup._width);
      // table.cells = table.cells.concat(row.cells);
      rowgroup = rowgroup._update({cells: rowgroup._cells.concat(row.cells)});
      growingCellsList = row.downwardGrowingCells;
      // table.height = Math.max(table.height, yCurrent+1);
      rowgroup = rowgroup._adjustHeight(yCurrent+1);
      // table.width = Math.max(table.width, row.width);
      rowgroup = rowgroup._adjustWidth(row.width);
      // row processing steps 4/16
      yCurrent++;
    }
    // 4
    // ending row group 1
    // growingCellsList = growingCellsList.map(cell => cell.growDownward(table.height-1));
    growingCellsList = growingCellsList.map(cell => cell.growDownward(rowgroup._height-1));
    // ending row group 2
    // When emptying the growing cells list, we need to finally add them to the table.
    // table.cells = table.cells.concat(growingCellsList);
    rowgroup = rowgroup._update({cells: rowgroup._cells.concat(growingCellsList)});
    // 3
    // if (table.height > yStart) {
    //   table.rowGroups.push(new RowGroup(yStart, table.height - yStart, group));
    // }
    //
    // return table.height;
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
