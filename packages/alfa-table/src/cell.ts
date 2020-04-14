import { Comparable } from "@siteimprove/alfa-comparable";
import {
  Element,
  hasName,
  isDescendantOf,
  isElementByName,
  Node,
  resolveAttributeReferences,
} from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { EnumeratedValueError } from "@siteimprove/alfa-parser";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Header } from "./header";
import { isEmpty, parseSpan } from "./helpers";
import { Table } from "./table";

const { parseEnumeratedAttribute } = Element;
const { some } = Iterable;
const { and, equals, not } = Predicate;
const { Comparison } = Comparable;

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#concept-cell
 */
export class Cell implements Comparable<Cell>, Equatable, Serializable {
  private readonly _kind: Cell.Kind;
  private readonly _x: number;
  private readonly _y: number;
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _variant: Option<Header.Variant>;
  private readonly _headers: Array<Element>;

  public static of(
    kind: Cell.Kind,
    x: number,
    y: number,
    width: number,
    height: number,
    element: Element,
    variant: Option<Header.Variant> = None,
    headers: Array<Element> = []
  ): Cell {
    return new Cell(kind, x, y, width, height, element, variant, headers);
  }

  private constructor(
    kind: Cell.Kind,
    x: number,
    y: number,
    width: number,
    height: number,
    element: Element,
    variant: Option<Header.Variant>,
    headers: Array<Element>
  ) {
    this._kind = kind;
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._element = element;
    this._variant = variant;
    this._headers = headers;
  }

  public get anchor(): { x: number; y: number } {
    return { x: this._x, y: this._y };
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

  public get variant(): Option<Header.Variant> {
    return this._variant;
  }

  public isCovering(x: number, y: number): boolean {
    return !(
      // cell is *not* covering if either
      (
        x < this._x || // slot is left of cell
        this._x + this._width - 1 < x || // slot is right of cell
        y < this._y || // slot is above cell
        this._y + this._height - 1 < y
      ) // slot is below cell
    );
  }

  /**
   * compare cell according to their anchor
   * in a given group of cells (row, rowgroup, table, …), no two different cells can have the same anchor, so this is good.
   */
  public compare(cell: Cell): Comparable.Comparison {
    if (this._y < cell._y) return Comparison.Less;
    if (this._y > cell._y) return Comparison.More;
    if (this._x < cell._x) return Comparison.Less;
    if (this._x > cell._x) return Comparison.More;
    return Comparison.Equal;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Cell &&
      this._kind === value._kind &&
      this._width === value._width &&
      this._height === value._height &&
      this._x === value._x &&
      this._y === value._y &&
      this._element.equals(value._element)
    );
  }

  public toJSON(): Cell.JSON {
    return {
      kind: this._kind,
      anchor: this.anchor,
      width: this._width,
      height: this._height,
      element: this._element.toJSON(),
      variant: this._variant.toJSON(),
      headers: this._headers.map((header) => header.toJSON()),
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
    element: Element.JSON;
    variant: Option.JSON;
    headers: Element.JSON[];
  }

  export enum Kind {
    Header = "header",
    Data = "data",
  }

  export class Builder implements Comparable<Builder>, Equatable, Serializable {
    // The product always has empty headers while building. Correct headers are filled in by the final export.
    private readonly _cell: Cell;
    private readonly _downwardGrowing: boolean;
    // This is the scope attribute, once correctly parsed.
    // The actual variant of the header is stored in the cell and can only be computed once the table is built.
    private readonly _scope: Option<Header.Scope>;
    // Note 1: The HTML spec makes no real difference between Cell and the element in it and seems to use the word "cell"
    //         all over the place. Storing here elements instead of Cell is easier because Elements don't change during
    //         the computation, so there is no need to either update all usages or have side effects for updating Cell.
    // Note 2: Explicit and Implicit headings are normally mutually exclusive. However, it seems that some browsers
    //         fallback to implicit headers if explicit ones refer to inexistant elements. So keeping both is safer.
    //         Currently not exposing both to final cell, but easy to do if needed.
    // Note 3: Headers are empty when building the cell, they are filled in once the table is built because we need
    //         to know the full table in order to find both explicit and implicit headers.
    private readonly _explicitHeaders: Array<Element>;
    private readonly _implicitHeaders: Array<Element>;

    public static of(
      kind: Cell.Kind,
      x: number,
      y: number,
      width: number,
      height: number,
      element: Element,
      variant: Option<Header.Variant> = None,
      downwardGrowing: boolean = false,
      scope: Option<Header.Scope> = None,
      explicitHeaders: Array<Element> = [],
      implicitHeaders: Array<Element> = []
    ): Builder {
      return new Builder(
        kind,
        x,
        y,
        width,
        height,
        element,
        variant,
        downwardGrowing,
        scope,
        explicitHeaders,
        implicitHeaders
      );
    }

    private constructor(
      kind: Cell.Kind,
      x: number,
      y: number,
      width: number,
      height: number,
      element: Element,
      variant: Option<Header.Variant>,
      downwardGrowing: boolean,
      scope: Option<Header.Scope>,
      explicitHeaders: Array<Element>,
      implicitHeaders: Array<Element>
    ) {
      this._cell = Cell.of(kind, x, y, width, height, element, variant, []);
      this._downwardGrowing = downwardGrowing;
      this._scope = scope;
      this._explicitHeaders = explicitHeaders;
      this._implicitHeaders = implicitHeaders;
    }

    private _update(update: {
      kind?: Cell.Kind;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      element?: Element;
      variant?: Option<Header.Variant>;
      downwardGrowing?: boolean;
      scope?: Option<Header.Scope>;
      explicitHeaders?: Array<Element>;
      implicitHeaders?: Array<Element>;
    }): Builder {
      return Builder.of(
        update.kind !== undefined ? update.kind : this.kind,
        update.x !== undefined ? update.x : this.anchor.x,
        update.y !== undefined ? update.y : this.anchor.y,
        update.width !== undefined ? update.width : this.width,
        update.height !== undefined ? update.height : this.height,
        update.element !== undefined ? update.element : this.element,
        update.variant !== undefined ? update.variant : this.variant,
        update.downwardGrowing !== undefined
          ? update.downwardGrowing
          : this._downwardGrowing,
        update.scope !== undefined ? update.scope : this.scope,
        update.explicitHeaders !== undefined
          ? update.explicitHeaders
          : this._explicitHeaders,
        update.implicitHeaders !== undefined
          ? update.implicitHeaders
          : this._implicitHeaders
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
        this.variant,
        // the presence of a "headers" attribute is enough to use explicit headers, even if this is an empty list
        // @see Step 3 of https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
        // some browsers use fallback implicit headers when explicit resolve to nothing. We may want to do this
        // and use some browser specific, either here or by exporting both list to the product and selecting later.
        this.element.attribute("headers") === None
          ? this._implicitHeaders
          : this._explicitHeaders
      );
    }

    public get scope(): Option<Header.Scope> {
      return this._scope;
    }

    public get anchor(): { x: number; y: number } {
      return this._cell.anchor;
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

    public get variant(): Option<Header.Variant> {
      return this._cell.variant;
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

    public isCovering(x: number, y: number): boolean {
      return this._cell.isCovering(x, y);
    }

    public compare(cell: Builder): Comparable.Comparison {
      return this._cell.compare(cell._cell);
    }

    public anchorAt(x: number, y: number): Builder {
      return this._update({ x, y });
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-growing-downward-growing-cells
     */
    public growDownward(yCurrent: number): Builder {
      // we need yCurrent to be covered, hence y+h-1 >= yCurrent, hence h >= yCurrent-y+1
      return this._update({
        height: Math.max(this.height, yCurrent - this.anchor.y + 1),
      });
    }

    /**
     * see @https://html.spec.whatwg.org/multipage/tables.html#column-header
     * and following
     */
    private _isCoveringArea(
      x: number,
      y: number,
      w: number,
      h: number
    ): boolean {
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
      table: Table.Builder
    ): Header.Variant | undefined {
      switch (scope) {
        // https://html.spec.whatwg.org/multipage/tables.html#column-group-header
        case Header.Scope.ColGroup:
          return Header.Variant.ColGroup;
        // https://html.spec.whatwg.org/multipage/tables.html#row-group-header
        case Header.Scope.RowGroup:
          return Header.Variant.RowGroup;
        // https://html.spec.whatwg.org/multipage/tables.html#column-header
        case Header.Scope.Column:
          return Header.Variant.Column;
        // https://html.spec.whatwg.org/multipage/tables.html#row-header
        case Header.Scope.Row:
          return Header.Variant.Row;
        // https://html.spec.whatwg.org/multipage/tables.html#column-header
        // https://html.spec.whatwg.org/multipage/tables.html#row-header
        case Header.Scope.Auto:
          // Not entirely clear whether "any of the cells covering slots with y-coordinates y .. y+height-1."
          // means "for any x" or just for the x of the cell. Using "for all x"
          if (
            some(table.cells, (cell) =>
              cell._isDataCoveringArea(
                0,
                this.anchor.y,
                table.width,
                this.height
              )
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
              return Header.Variant.Row;
            }
          } else {
            // there are *no* data cells in any of the cells covering slots with y-coordinates y .. y+height-1.
            return Header.Variant.Column;
          }
      }
    }

    public addHeaderVariant(table: Table.Builder): Builder {
      return this._update({
        variant: this._scope.flatMap((scope) =>
          Option.from(this._scopeToState(scope, table))
        ),
      });
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#internal-algorithm-for-scanning-and-assigning-header-cells
     */
    private _internalHeaderScanning(
      table: Table.Builder,
      initialX: number,
      initialY: number,
      decreaseX: boolean
    ): Array<Builder> {
      // The principal cell is this.
      const deltaX = decreaseX ? -1 : 0;
      const deltaY = decreaseX ? 0 : -1;
      let headersList: Array<Builder> = []; // new headers found by this algorithm

      // 3
      let opaqueHeaders: Array<Builder> = [];
      // 4
      let inHeaderBlock = false;
      let headersFromCurrentBlock: Array<Builder> = [];
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
        const covering = table.cells.filter((cell) => cell.isCovering(x, y));
        if (covering.length !== 1) {
          // More than one cell covering a slot is a table model error. Not sure why the test is in the algorithm…
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
          let blocked;
          // 9.4
          const variant = currentCell.variant;
          if (deltaX === 0) {
            blocked =
              opaqueHeaders.some(
                (cell) =>
                  cell.anchor.x === currentCell.anchor.x &&
                  cell.width === currentCell.width
              ) || !variant.equals(Some.of(Header.Variant.Column));
          } else {
            // deltaY === 0
            blocked =
              opaqueHeaders.some(
                (cell) =>
                  cell.anchor.y === currentCell.anchor.y &&
                  cell.height === currentCell.height
              ) || !variant.equals(Some.of(Header.Variant.Row));
          }
          // 9.5
          if (!blocked) headersList.push(currentCell);
        }
        if (currentCell.kind === Cell.Kind.Data && inHeaderBlock) {
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
      node: Node,
      table: Table.Builder
    ): Cell.Builder {
      // 3 / headers attribute / 1
      const elements = resolveAttributeReferences(
        this.element,
        node,
        "headers"
      ).filter(
        // 3 / headers attribute / 2
        and(
          and(
            // only keep cells in the table
            isElementByName("th", "td"),
            isDescendantOf(table.element)
          ),
          and(
            // remove principal cell
            not(equals(this.element)),
            // Step 4: remove empty cells
            not(isEmpty)
          )
        )
      );

      return this._update({ explicitHeaders: elements });
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
     */
    private _assignImplicitHeaders(table: Table.Builder): Builder {
      // 1
      let headersList: Array<Builder> = [];
      // 2 principal cell = this, nothing to do.
      // 3 / no header attribute (3.1, 3.2: use this)
      // 3.3: find row headers in the row(s) covered by the principal cell
      for (let y = this.anchor.y; y < this.anchor.y + this.height; y++) {
        headersList.push(
          ...this._internalHeaderScanning(table, this.anchor.x, y, true)
        );
      }
      // 3.4: find column headers in the column(s) covered by the principal cell
      for (let x = this.anchor.x; x < this.anchor.x + this.width; x++) {
        headersList.push(
          ...this._internalHeaderScanning(table, x, this.anchor.y, false)
        );
      }
      // 3.5: find row group headers for the rowgroup of the principal cell
      const principalRowGroup = Iterable.find(table.rowGroups, (rg) =>
        rg.isCovering(this.anchor.y)
      );
      if (principalRowGroup.isSome()) {
        // if the principal cell is in a rowgroup,
        const headers = table.cells
          // get all rowgroup headers
          .filter((cell) =>
            cell.variant.equals(Some.of(Header.Variant.RowGroup))
          )
          // keep the ones inside the rowgroup of the principal cell
          .filter((rowGroupHeader) =>
            principalRowGroup.get().isCovering(rowGroupHeader.anchor.y)
          )
          // keep the ones that are top and left of the principal cell
          .filter(
            (cell) =>
              cell.anchor.x < this.anchor.x + this.width &&
              cell.anchor.y < this.anchor.y + this.height
          );

        headersList.push(...headers);
      }
      // 3.6: find column group headers for the colgroup of the principal cell
      const principalColGroup = Iterable.find(table.colGroups, (cg) =>
        cg.isCovering(this.anchor.x)
      );
      if (principalColGroup.isSome()) {
        // if the principal cell is in a colgroup,
        const headers = table.cells
          // get all colgroup headers
          .filter((cell) =>
            cell.variant.equals(Some.of(Header.Variant.ColGroup))
          )
          // keep the ones inside the colgroup of the principal cell
          .filter((colGroupHeader) =>
            principalColGroup.get().isCovering(colGroupHeader.anchor.x)
          )
          // keep the ones that are top and left of the principal cell
          .filter(
            (cell) =>
              cell.anchor.x < this.anchor.x + this.width &&
              cell.anchor.y < this.anchor.y + this.height
          );

        headersList.push(...headers);
      }

      headersList = headersList.filter(
        (cell, idx) =>
          // 4 (remove empty cells)
          !isEmpty(cell.element) &&
          // 6 remove principal cell
          !cell.equals(this) &&
          // 5 (remove duplicates)
          headersList.indexOf(cell) === idx
      );

      return this._update({
        implicitHeaders: headersList.map((cell) => cell.element),
      });
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
     */
    public assignHeaders(node: Node, table: Table.Builder): Cell.Builder {
      return this._assignExplicitHeaders(node, table)._assignImplicitHeaders(
        table
      );
    }

    public equals(value: unknown): value is this {
      return value instanceof Builder && this._cell.equals(value._cell);
    }

    public toJSON(): Cell.Builder.JSON {
      return {
        cell: this._cell.toJSON(),
        state: this._scope.toJSON(),
        explicitHeaders: this._explicitHeaders.map((header) => header.toJSON()),
        implicitHeaders: this._implicitHeaders.map((header) => header.toJSON()),
      };
    }
  }

  export namespace Builder {
    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
     */
    export function from(
      cell: Element,
      x: number = -1,
      y: number = -1
    ): Result<Builder, string> {
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
        [EnumeratedValueError.Missing, Header.Scope.Auto],
        [EnumeratedValueError.Invalid, Header.Scope.Auto],
      ]);
      const scope =
        kind === Cell.Kind.Data
          ? None
          : parseEnumeratedAttribute("scope", scopeMapping)(cell);

      return Ok.of(
        Builder.of(kind, x, y, colspan, rowspan, cell, None, grow, scope)
      );
    }

    export interface JSON {
      [key: string]: json.JSON;

      cell: Cell.JSON;
      state: Option.JSON;
      explicitHeaders: Element.JSON[];
      implicitHeaders: Element.JSON[];
    }
  }
}
