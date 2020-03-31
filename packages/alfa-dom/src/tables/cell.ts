import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";

import * as json from "@siteimprove/alfa-json";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import { BuildingTable, Document, Element } from "..";
import {
  hasName,
  isDescendantOf,
  isElementByName,
  isEmpty,
  isEqual,
  parseAttribute,
  parseEnumeratedAttribute,
  parseSpan,
  parseTokensList,
  resolveReferences,
} from "./helpers";

const { some } = Iterable;
const { and, equals, not } = Predicate;

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#concept-cell
 */
export class Cell implements Equatable, Serializable {
  private readonly _kind: Cell.Kind;
  private readonly _anchorX: number;
  private readonly _anchorY: number;
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _headers: Array<Element>;

  public static of(
    kind: Cell.Kind,
    x: number,
    y: number,
    w: number,
    h: number,
    element: Element,
    headers: Array<Element> = []
  ): Cell {
    return new Cell(kind, x, y, w, h, element, headers);
  }

  private constructor(
    kind: Cell.Kind,
    x: number,
    y: number,
    w: number,
    h: number,
    element: Element,
    headers: Array<Element>
  ) {
    this._kind = kind;
    this._anchorX = x;
    this._anchorY = y;
    this._width = w;
    this._height = h;
    this._element = element;
    this._headers = headers;
  }

  // debug
  public get name(): string {
    return this._element.attribute("id").get().value;
  }

  public get anchor(): { x: number; y: number } {
    return { x: this._anchorX, y: this._anchorY };
  }
  public get width(): number {
    return this._width;
  }
  public get height(): number {
    return this._height;
  }
  public get kind(): Cell.Kind {
    return this._kind;
  }
  public get element(): Element {
    return this._element;
  }
  public get headers(): Iterable<Element> {
    return this._headers;
  }

  public isCovering(x: number, y: number): boolean {
    return !(
      // cell is *not* covering if either
      (
        x < this._anchorX || // slot is left of cell
        this._anchorX + this._width - 1 < x || // slot is right of cell
        y < this._anchorY || // slot is above cell
        this._anchorY + this._height - 1 < y
      ) // slot is below cell
    );
  }

  /**
   * compare cell according to their anchor
   * in a given group of cells (row, rowgroup, table, …), no two different cells can have the same anchor, so this is good.
   */
  public compare(cell: Cell): number {
    if (this._anchorY < cell._anchorY) return -1;
    if (this._anchorY > cell._anchorY) return 1;
    if (this._anchorX < cell._anchorX) return -1;
    if (this._anchorX > cell._anchorX) return 1;
    return 0;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Cell &&
      this._kind === value._kind &&
      this._width === value._width &&
      this._height === value._height &&
      this._anchorX === value._anchorX &&
      this._anchorY === value._anchorY &&
      this._element.equals(value._element)
    );
  }

  public toJSON(): Cell.JSON {
    return {
      kind: this._kind,
      anchor: this.anchor,
      width: this._width,
      height: this._height,
      element: this.name, // this._element.toJSON(),
      headers: this._headers.map(
        (header) => header.attribute("id").get().value
      ), // this._headers.map((header) => header.toJSON()),
    };
  }
}

export namespace Cell {
  export interface JSON {
    [key: string]: json.JSON;

    kind: Kind;
    anchor: { x: number; y: number };
    width: number;
    height: number;
    element: string; //Element.JSON;
    headers: string[]; //Element.JSON[];
  }

  export enum Kind {
    Header = "HEADER",
    Data = "DATA",
  }
}

export class BuildingCell implements Equatable, Serializable {
  // headers are always empty in the cell, filled in when exporting
  private readonly _cell: Cell;
  private readonly _downwardGrowing: boolean;
  private readonly _scope: Option<Header.Scope>;
  // Note 1: The HTML spec makes no real difference between Cell and the element in it and seems to use the word "cell"
  //         all over the place. Storing here elements instead of Cell is easier because Elements don't change during
  //         the computation, so there is no need to either update all usages or have side effects for updating Cell.
  // Note 2: Explicit and Implicit headings are normally mutually exclusive. However, it seems that some browsers
  //         fallback to implicit headers if explicit ones refer to inexistant elements. So keeping both is safer.
  //         Currently not exposing both to final cell, but easy to do if needed.
  private readonly _explicitHeaders: Array<Element>;
  private readonly _implicitHeaders: Array<Element>;

  public static of(
    kind: Cell.Kind,
    x: number,
    y: number,
    w: number,
    h: number,
    element: Element,
    downwardGrowing: boolean = false,
    state: Option<Header.Scope> = None,
    eHeaders: Array<Element> = [],
    iHeaders: Array<Element> = []
  ): BuildingCell {
    return new BuildingCell(
      kind,
      x,
      y,
      w,
      h,
      element,
      downwardGrowing,
      state,
      eHeaders,
      iHeaders
    );
  }

  private constructor(
    kind: Cell.Kind,
    x: number,
    y: number,
    w: number,
    h: number,
    element: Element,
    downwardGrowing: boolean,
    state: Option<Header.Scope>,
    eHeaders: Array<Element>,
    iHeaders: Array<Element>
  ) {
    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#attr-th-scope
     */
    this._cell = Cell.of(kind, x, y, w, h, element, []);
    this._downwardGrowing = downwardGrowing;
    this._scope = state;
    this._explicitHeaders = eHeaders;
    this._implicitHeaders = iHeaders;
  }

  private _update(update: {
    kind?: Cell.Kind;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    element?: Element;
    downwardGrowing?: boolean;
    scope?: Option<Header.Scope>;
    eHeaders?: Array<Element>;
    iHeaders?: Array<Element>;
  }): BuildingCell {
    return BuildingCell.of(
      update.kind !== undefined ? update.kind : this.kind,
      update.x !== undefined ? update.x : this.anchor.x,
      update.y !== undefined ? update.y : this.anchor.y,
      update.w !== undefined ? update.w : this.width,
      update.h !== undefined ? update.h : this.height,
      update.element !== undefined ? update.element : this.element,
      update.downwardGrowing !== undefined
        ? update.downwardGrowing
        : this._downwardGrowing,
      update.scope !== undefined ? update.scope : this.scope,
      update.eHeaders !== undefined ? update.eHeaders : this._explicitHeaders,
      update.iHeaders !== undefined ? update.iHeaders : this._implicitHeaders
    );
  }

  public get cell(): Cell {
    return Cell.of(
      this.kind,
      this.anchor.x,
      this.anchor.y,
      this.width,
      this.height,
      this.element,
      // the presence of a "headers" attribute is enough to use explicit headers, even if this is an empty list
      // @see Step 3 of https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
      this.element.attribute("headers") === None
        ? this._implicitHeaders
        : this._explicitHeaders
    );
  }
  public get scope(): Option<Header.Scope> {
    return this._scope;
  }
  // debug
  public get name(): string {
    return this._cell.element.attribute("id").get().value;
  }

  public get anchor(): { x: number; y: number } {
    return { x: this._cell.anchor.x, y: this._cell.anchor.y };
  }
  public get width(): number {
    return this._cell.width;
  }
  public get height(): number {
    return this._cell.height;
  }
  public get kind(): Cell.Kind {
    return this._cell.kind;
  }
  public get element(): Element {
    return this._cell.element;
  }
  public get downwardGrowing(): boolean {
    return this._downwardGrowing;
  }
  public get explicitHeaders(): Array<Element> {
    return this._explicitHeaders;
  }
  public get implicitHeaders(): Array<Element> {
    return this._implicitHeaders;
  }

  /**
   * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
   */
  public static from(
    cell: Element,
    x: number = -1,
    y: number = -1
  ): Result<BuildingCell, string> {
    if (cell.name !== "th" && cell.name !== "td")
      return Err.of("This element is not a table cell");

    const colspan = parseSpan(cell, "colspan", 1, 1000, 1);
    // 9
    let rowspan = parseSpan(cell, "rowspan", 0, 65534, 1);
    // 10 assuming we are not in quirks mode because I don't know if we test that yet…
    // Unsurprisingly, "rowspan=0" is not universally supported (that is, not by Edge…)
    const grow = rowspan === 0;
    if (rowspan === 0) {
      rowspan = 1;
    }

    // 11
    const kind = hasName(equals("th"))(cell)
      ? Cell.Kind.Header
      : Cell.Kind.Data;

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#attr-th-scope
     */
    const scopeMapping = Map.from([
      ["row", Header.Scope.Row],
      ["col", Header.Scope.Column],
      ["rowgroup", Header.Scope.RowGroup],
      ["colgroup", Header.Scope.ColGroup],
      ["missing", Header.Scope.Auto],
      ["invalid", Header.Scope.Auto],
    ]);
    const scope =
      kind === Cell.Kind.Data
        ? None
        : Some.of(parseEnumeratedAttribute("scope", scopeMapping)(cell).get());

    return Ok.of(
      BuildingCell.of(kind, x, y, colspan, rowspan, cell, grow, scope)
    );
  }

  public isCovering(x: number, y: number): boolean {
    return this._cell.isCovering(x, y);
  }

  public compare(cell: BuildingCell): number {
    return this._cell.compare(cell.cell);
  }

  public anchorAt(x: number, y: number): BuildingCell {
    return this._update({ x, y });
  }

  /**
   * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-growing-downward-growing-cells
   */
  public growDownward(yCurrent: number): BuildingCell {
    // we need yCurrent to be covered, hence y+h-1>=yCurrent, hence h>=yCurrent-y+1
    return this._update({
      h: Math.max(this.height, yCurrent - this.anchor.y + 1),
    });
  }

  /**
   * see @https://html.spec.whatwg.org/multipage/tables.html#column-header
   * and following
   */
  private _isCoveringArea(x: number, y: number, w: number, h: number): boolean {
    for (let col = x; col < x + w; col++) {
      for (let row = y; row < y + h; row++) {
        if (this.isCovering(col, row)) return true;
      }
    }
    return false;
  }
  private _isDataCoveringArea(
    x: number,
    y: number,
    w: number,
    h: number
  ): boolean {
    return this.kind === Cell.Kind.Data && this._isCoveringArea(x, y, w, h);
  }
  private _scopeToState(
    scope: Header.Scope,
    table: BuildingTable
  ): Header.State | undefined {
    switch (scope) {
      // https://html.spec.whatwg.org/multipage/tables.html#column-group-header
      case Header.Scope.ColGroup:
        return Header.State.ColGroup;
      // https://html.spec.whatwg.org/multipage/tables.html#row-group-header
      case Header.Scope.RowGroup:
        return Header.State.RowGroup;
      // https://html.spec.whatwg.org/multipage/tables.html#column-header
      case Header.Scope.Column:
        return Header.State.Column;
      // https://html.spec.whatwg.org/multipage/tables.html#row-header
      case Header.Scope.Row:
        return Header.State.Row;
      // https://html.spec.whatwg.org/multipage/tables.html#column-header
      // https://html.spec.whatwg.org/multipage/tables.html#row-header
      case Header.Scope.Auto:
        // Not entirely clear whether "any of the cells covering slots with y-coordinates y .. y+height-1."
        // means "for any x" or just for the x of the cell. Using "for all x"
        if (
          some(table.cells, (cell) =>
            cell._isDataCoveringArea(0, this.anchor.y, table.width, this.height)
          )
        ) {
          // there are *some* data cells in any of the cells covering slots with y-coordinates y .. y+height-1.
          if (
            some(table.cells, (cell) =>
              cell._isDataCoveringArea(
                this.anchor.x,
                0,
                this.width,
                table.height
              )
            )
          ) {
            // there are *some* data cells in any of the cells covering slots with x-coordinates x .. x+width-1.
            return undefined;
          } else {
            // there are *no* data cells in any of the cells covering slots with x-coordinates x .. x+width-1.
            return Header.State.Row;
          }
        } else {
          // there are *no* data cells in any of the cells covering slots with y-coordinates y .. y+height-1.
          return Header.State.Column;
        }
    }
  }
  public headerState(table: BuildingTable): Option<Header.State> {
    return this._scope.flatMap((scope) =>
      Option.from(this._scopeToState(scope, table))
    );
  }

  /**
   * @see https://html.spec.whatwg.org/multipage/tables.html#internal-algorithm-for-scanning-and-assigning-header-cells
   */
  private _internalHeaderScanning(
    table: BuildingTable,
    initialX: number,
    initialY: number,
    decreaseX: boolean
  ): Array<BuildingCell> {
    // The principal cell is this.
    const deltaX = decreaseX ? -1 : 0;
    const deltaY = decreaseX ? 0 : -1;
    let headersList: Array<BuildingCell> = []; // new headers found by this algorithm

    // 3
    let opaqueHeaders: Array<BuildingCell> = [];
    // 4
    let inHeaderBlock = false;
    let headersFromCurrentBlock: Array<BuildingCell> = [];
    if (this.kind === Cell.Kind.Header) {
      inHeaderBlock = true;
      headersFromCurrentBlock.push(this);
    }

    // 1, 2, 5, 6, 10
    for (
      let x = initialX + deltaX, y = initialY + deltaY;
      x >= 0 && y >= 0;
      x += deltaX, y += deltaY
    ) {
      // 7
      const covering = [...table.cells].filter((cell) => cell.isCovering(x, y));
      if (covering.length !== 1) {
        // More than one cell covering a slot is a table model error. Not sure why the test is in the algo…
        // (0 cell is possible, more than one is not)
        continue;
      }
      // 8
      const currentCell = covering[0];
      // 9
      if (currentCell.kind === Cell.Kind.Header) {
        // 9.1
        inHeaderBlock = true;
        // 9.2
        headersFromCurrentBlock.push(currentCell);
        // 9.3
        let blocked = false;
        // 9.4
        const state = currentCell.headerState(table);
        if (deltaX === 0) {
          if (
            opaqueHeaders.some(
              (cell) =>
                cell.anchor.x === currentCell.anchor.x &&
                cell.width === currentCell.width
            )
          ) {
            blocked = true;
          }
          if (!state.equals(Some.of(Header.State.Column))) {
            blocked = true;
          }
        } else {
          // deltaY === 0
          if (
            opaqueHeaders.some(
              (cell) =>
                cell.anchor.y === currentCell.anchor.y &&
                cell.height === currentCell.height
            )
          ) {
            blocked = true;
          }
          if (!state.equals(Some.of(Header.State.Row))) {
            blocked = true;
          }
        }
        // 9.5
        if (!blocked) headersList.push(currentCell);
      } else {
        inHeaderBlock = false;
        opaqueHeaders.push(...headersFromCurrentBlock);
        headersFromCurrentBlock = [];
      }
    }

    return headersList;
  }

  /**
   * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
   */
  private _assignExplicitHeaders(
    table: BuildingTable,
    document: Document | undefined = undefined
  ): BuildingCell {
    // "no document" is allowed for easier unit test (better isolation).
    // 3 / headers attribute / 1
    const idsList: Array<string> = this.element
      .attribute("headers")
      .map(parseAttribute(parseTokensList))
      .map((r) => r.get())
      .getOr([]);

    // 3 / headers attribute / 2
    const topNode = document === undefined ? table.element : document;

    const elements = resolveReferences(topNode, idsList).filter(
      (element) =>
        and(
          and(
            // only keep cells in the table
            isElementByName("th", "td"),
            isDescendantOf(table.element)
          ),
          and(
            // remove principal cell
            not(isEqual(this.element)),
            // Step 4: remove empty cell
            not(isEmpty)
          )
        )

      // table.element
      //   .descendants()
      //   .find((elt) => element.equals(elt))
      //   .isSome() &&
      // isElementByName("th", "td")(element) &&
      // // remove principal cell
      // isNotEqual(this.element)(element) &&
      // // Step 4: remove empty cell
      // not(isEmpty)(element)
    );

    return this._update({ eHeaders: elements });
  }

  /**
   * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
   */
  private _assignImplicitHeaders(table: BuildingTable): BuildingCell {
    // const debug = this.name === "en";
    // if (debug) console.log(`Implicit headers of ${this.name}`);
    // 1
    let headersList: Array<BuildingCell> = [];
    // 2 principal cell = this, nothing to do.
    // 3 / no header attribute (3.1, 3.2: use this)
    // 3.3
    for (let y = this.anchor.y; y < this.anchor.y + this.height; y++) {
      headersList = headersList.concat(
        this._internalHeaderScanning(table, this.anchor.x, y, true)
      );
    }
    // if (debug)  console.log(`   After first loop: ${headersList.map(cell => cell.name)}`);
    // 3.4
    for (let x = this.anchor.x; x < this.anchor.x + this.width; x++) {
      headersList = headersList.concat(
        this._internalHeaderScanning(table, x, this.anchor.y, false)
      );
    }
    // if (debug)  console.log(`   After second loop: ${headersList.map(cell => cell.name)}`);
    // 3.5
    const rowgroup = Iterable.find(table.rowGroups, (rg) =>
      rg.isCovering(this.anchor.y)
    );
    if (rowgroup.isSome()) {
      const rowGroupHeaders = [...table.cells].filter((cell) =>
        cell.headerState(table).equals(Some.of(Header.State.RowGroup))
      );
      const anchored = rowGroupHeaders.filter((cell) =>
        rowgroup.get().isCovering(cell.anchor.y)
      );
      const leftAndUp = anchored.filter(
        (cell) =>
          cell.anchor.x < this.anchor.x + this.width &&
          cell.anchor.y < this.anchor.y + this.height
      );

      headersList = headersList.concat(leftAndUp);
    }
    // if (debug)  console.log(`   After row groups: ${headersList.map(cell => cell.name)}`);
    // 3.6
    const colgroup = Iterable.find(table.colGroups, (cg) =>
      cg.isCovering(this.anchor.x)
    );
    if (colgroup.isSome()) {
      const colGroupHeaders = [...table.cells].filter((cell) =>
        cell.headerState(table).equals(Some.of(Header.State.ColGroup))
      );
      const anchored = colGroupHeaders.filter((cell) =>
        colgroup.get().isCovering(cell.anchor.x)
      );
      const leftAndUp = anchored.filter(
        (cell) =>
          cell.anchor.x < this.anchor.x + this.width &&
          cell.anchor.y < this.anchor.y + this.height
      );

      headersList = headersList.concat(leftAndUp);
    }
    // if (debug)  console.log(`   After col groups: ${headersList.map(cell => cell.name)}`);

    headersList = headersList
      // 5 (remove duplicates)
      .filter((cell, idx) => headersList.indexOf(cell) === idx)
      // 4 (remove empty cells) & 6 remove principal cell
      .filter((cell) => !isEmpty(cell.element) && !cell.equals(this));
    // if (debug)  console.log(`   After clean up: ${headersList.map(cell => cell.name)}`);

    return this._update({ iHeaders: headersList.map((cell) => cell.element) });
  }

  /**
   * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
   */
  public assignHeaders(table: BuildingTable): BuildingCell {
    return this._assignExplicitHeaders(table)._assignImplicitHeaders(table);
  }

  public equals(value: unknown): value is this {
    return value instanceof BuildingCell && this._cell.equals(value._cell);
  }

  public toJSON(): BuildingCell.JSON {
    return {
      cell: this._cell.toJSON(),
      state: this._scope.toJSON(),
      explicitHeaders: this._explicitHeaders.map((header) => header.toJSON()),
      implicitHeaders: this._implicitHeaders.map((header) => header.toJSON()),
    };
  }
}

export namespace BuildingCell {
  export interface JSON {
    [key: string]: json.JSON;
    cell: Cell.JSON;
    state: Option.JSON;
    explicitHeaders: Element.JSON[];
    implicitHeaders: Element.JSON[];
  }
}

export namespace Header {
  export enum Scope { // state of the scope attribute
    Auto = "AUTO",
    Row = "ROW",
    Column = "COLUMN",
    RowGroup = "ROW_GROUP",
    ColGroup = "COL_GROUP",
  }

  export enum State { // https://html.spec.whatwg.org/multipage/tables.html#column-header and friends
    Row = "ROW",
    Column = "COLUMN",
    RowGroup = "ROW_GROUP",
    ColGroup = "COL_GROUP",
  }
}
