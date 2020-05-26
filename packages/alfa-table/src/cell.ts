import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";

import * as json from "@siteimprove/alfa-json";

import { Scope } from "./scope";
import { Table } from "./table";
import { parseSpan } from "./helpers";

const { some } = Iterable;
const { and, equals, not } = Predicate;
const { isElement, hasName, hasNamespace, hasId } = Element;

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#concept-cell
 */
export class Cell implements Comparable<Cell>, Equatable, Serializable {
  public static of(
    kind: Cell.Kind,
    x: number,
    y: number,
    width: number,
    height: number,
    element: Element,
    scope: Option<Scope.Resolved> = None,
    headers: Array<Element> = []
  ): Cell {
    return new Cell(kind, x, y, width, height, element, scope, headers);
  }

  private readonly _kind: Cell.Kind;
  private readonly _x: number;
  private readonly _y: number;
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _scope: Option<Scope.Resolved>;
  private readonly _headers: Array<Element>;

  private constructor(
    kind: Cell.Kind,
    x: number,
    y: number,
    width: number,
    height: number,
    element: Element,
    scope: Option<Scope.Resolved>,
    headers: Array<Element>
  ) {
    this._kind = kind;
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._element = element;
    this._scope = scope;
    this._headers = headers;
  }

  public get kind(): Cell.Kind {
    return this._kind;
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

  public get element(): Element {
    return this._element;
  }

  public get scope(): Option<Scope.Resolved> {
    return this._scope;
  }

  public get headers(): Iterable<Element> {
    return this._headers;
  }

  public isCovering(x: number, y: number): boolean {
    // The cell is *not* covering the slot (x, y) if either:
    // - the slot is left of the cell; or
    // - the slot is right of the cell; or
    // - the slot is above the cell; or
    // - the slot is below the cell.
    return !(
      x < this._x ||
      this._x + this._width - 1 < x ||
      y < this._y ||
      this._y + this._height - 1 < y
    );
  }

  /**
   * Compare this cell to another according to their anchors.
   *
   * @remarks
   * In a given group of cells (rows, row groups, tables, etc.), no two cells
   * will have the same anchor.
   */
  public compare(that: Cell): Comparison {
    if (this._y < that._y) {
      return Comparison.Less;
    }

    if (this._y > that._y) {
      return Comparison.Greater;
    }

    if (this._x < that._x) {
      return Comparison.Less;
    }

    if (this._x > that._x) {
      return Comparison.Greater;
    }

    return Comparison.Equal;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Cell &&
      this._kind === value._kind &&
      this._x === value._x &&
      this._y === value._y &&
      this._width === value._width &&
      this._height === value._height &&
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
      scope: this._scope.getOr(null),
      headers: this._headers.map((header) => header.toJSON()),
    };
  }
}

export namespace Cell {
  export interface JSON {
    [key: string]: json.JSON;
    kind: Kind;
    anchor: {
      x: number;
      y: number;
    };
    width: number;
    height: number;
    element: Element.JSON;
    scope: Scope.Resolved | null;
    headers: Element.JSON[];
  }

  export enum Kind {
    Header = "header",
    Data = "data",
  }

  export class Builder implements Comparable<Builder>, Equatable, Serializable {
    // Builder elements are referenced by Table Builder slot.
    // Therefore, we must keep the same element and update it to avoid breaking reference.
    // Any update to a Cell.Builder thus has to go through side effects :-(

    // The product always has empty headers while building. Correct headers are filled in by the final export.
    private _cell: Cell;
    private _downwardGrowing: boolean;
    // This is the scope attribute, once correctly parsed.
    // The actual variant of the header is stored in the cell and can only be computed once the table is built.
    private _scope: Option<Scope>;
    // Note 1: The HTML spec makes no real difference between Cell and the element in it and seems to use the word "cell"
    //         all over the place. Storing here elements instead of Cell is easier to avoid potential infinite loop when
    //         converting Cell.Builder to Cell.
    // Note 2: Explicit and Implicit headings are normally mutually exclusive. However, it seems that some browsers
    //         fallback to implicit headers if explicit ones refer to inexistant elements. So keeping both is safer.
    //         Currently not exposing both to final cell, but easy to do if needed.
    // Note 3: Headers are empty when building the cell, they are filled in once the table is built because we need
    //         to know the full table in order to find both explicit and implicit headers.
    private _explicitHeaders: Array<Element>;
    private _implicitHeaders: Array<Element>;

    public static of(
      kind: Cell.Kind,
      x: number,
      y: number,
      width: number,
      height: number,
      element: Element,
      variant: Option<Scope.Resolved> = None,
      downwardGrowing: boolean = false,
      scope: Option<Scope> = None,
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
      variant: Option<Scope.Resolved>,
      downwardGrowing: boolean,
      scope: Option<Scope>,
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
      variant?: Option<Scope.Resolved>;
      downwardGrowing?: boolean;
      scope?: Option<Scope>;
      explicitHeaders?: Array<Element>;
      implicitHeaders?: Array<Element>;
    }): Builder {
      const cell = Cell.of(
        update.kind !== undefined ? update.kind : this.kind,
        update.x !== undefined ? update.x : this.anchor.x,
        update.y !== undefined ? update.y : this.anchor.y,
        update.width !== undefined ? update.width : this.width,
        update.height !== undefined ? update.height : this.height,
        update.element !== undefined ? update.element : this.element,
        update.variant !== undefined ? update.variant : this.variant
      );

      this._cell = cell;
      this._downwardGrowing =
        update.downwardGrowing !== undefined
          ? update.downwardGrowing
          : this._downwardGrowing;
      this._scope = update.scope !== undefined ? update.scope : this.scope;
      this._explicitHeaders =
        update.explicitHeaders !== undefined
          ? update.explicitHeaders
          : this._explicitHeaders;
      this._implicitHeaders =
        update.implicitHeaders !== undefined
          ? update.implicitHeaders
          : this._implicitHeaders;

      return this; // for chaining
    }

    public get cell(): Cell {
      return Cell.of(
        this.kind,
        this.anchor.x,
        this.anchor.y,
        this.width,
        this.height,
        this.element,
        // The scope of the product is the resolved scope (the variant) of the builder.
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

    public get scope(): Option<Scope> {
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

    public get variant(): Option<Scope.Resolved> {
      return this._cell.scope;
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

    public compare(cell: Builder): Comparison {
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
          if (this.isCovering(col, row)) {
            return true;
          }
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
      scope: Scope,
      table: Table.Builder
    ): Option<Scope.Resolved> {
      switch (scope) {
        // https://html.spec.whatwg.org/multipage/tables.html#column-group-header
        case Scope.ColumnGroup:
          return Option.of(Scope.ColumnGroup);
        // https://html.spec.whatwg.org/multipage/tables.html#row-group-header
        case Scope.RowGroup:
          return Option.of(Scope.RowGroup);
        // https://html.spec.whatwg.org/multipage/tables.html#column-header
        case Scope.Column:
          return Option.of(Scope.Column);
        // https://html.spec.whatwg.org/multipage/tables.html#row-header
        case Scope.Row:
          return Option.of(Scope.Row);
        // https://html.spec.whatwg.org/multipage/tables.html#column-header
        // https://html.spec.whatwg.org/multipage/tables.html#row-header
        case Scope.Auto:
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
              return None;
            } else {
              // there are *no* data cells in any of the cells covering slots with x-coordinates x .. x+width-1.
              return Option.of(Scope.Row);
            }
          } else {
            // there are *no* data cells in any of the cells covering slots with y-coordinates y .. y+height-1.
            return Option.of(Scope.Column);
          }
      }
    }

    public addHeaderVariant(table: Table.Builder): Builder {
      // return Builder.of(
      //   this.kind,
      //   this.anchor.x,
      //   this.anchor.y,
      //   this.width,
      //   this.height,
      //   this.element,
      //   this._scope.flatMap((scope) => this._scopeToState(scope, table)),
      //   this.downwardGrowing,
      //   this.scope,
      //   this.explicitHeaders,
      //   this.implicitHeaders
      // );
      return this._update({
        variant: this._scope.flatMap((scope) =>
          this._scopeToState(scope, table)
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
        const covering = table.slots[x][y];
        if (covering.isNone()) {
          // More than one cell covering a slot is a table model error. Not sure why the test is in the algorithm…
          // (0 cell is possible, more than one is not)
          continue;
        }
        // 8
        const currentCell = covering.get();
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
              ) || !variant.equals(Some.of(Scope.Column));
          } else {
            // deltaY === 0
            blocked =
              opaqueHeaders.some(
                (cell) =>
                  cell.anchor.y === currentCell.anchor.y &&
                  cell.height === currentCell.height
              ) || !variant.equals(Some.of(Scope.Row));
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
    private _assignExplicitHeaders(table: Table.Builder): Cell.Builder {
      const headers = this.element.attribute("headers");

      if (headers.isNone()) {
        return this;
      }

      // 3 / headers attribute / 1
      const elements = headers
        .get()
        .tokens()
        .flatMap((id) =>
          Sequence.from(
            this.element
              .root()
              .descendants()
              .find(and(isElement, hasId(id)))
          )
        )
        .filter(
          and(
            isElement,
            and(
              // 3 / headers attribute / 2
              hasName("th", "td"),
              hasNamespace(Namespace.HTML),
              // Only keep cells in the table
              (element) =>
                element
                  .closest(and(isElement, hasName("table")))
                  .some(equals(table.element)),
              // Remove principal cell
              not(equals(this.element)),
              // Remove empty cells
              not((element) => element.children().isEmpty())
            )
          )
        );

      return this._update({ explicitHeaders: elements.toArray() });
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
          .filter((cell) => cell.variant.equals(Some.of(Scope.RowGroup)))
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
          .filter((cell) => cell.variant.equals(Some.of(Scope.ColumnGroup)))
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
          !cell.element.children().isEmpty() &&
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
    public assignHeaders(table: Table.Builder): Cell.Builder {
      return this._assignExplicitHeaders(table)._assignImplicitHeaders(table);
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
    export interface JSON {
      [key: string]: json.JSON;
      cell: Cell.JSON;
      state: Option.JSON;
      explicitHeaders: Element.JSON[];
      implicitHeaders: Element.JSON[];
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
     */
    export function from(
      cell: Element,
      x: number = -1,
      y: number = -1
    ): Result<Builder, string> {
      if (cell.name !== "th" && cell.name !== "td") {
        return Err.of("This element is not a table cell");
      }

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
      const kind = cell.name === "th" ? Cell.Kind.Header : Cell.Kind.Data;

      /**
       * @see https://html.spec.whatwg.org/multipage/tables.html#attr-th-scope
       */
      const scope =
        kind === Cell.Kind.Data
          ? None
          : cell
              .attribute("scope")
              .flatMap((attribute) =>
                attribute.enumerate("col", "colgroup", "row", "rowgroup")
              )
              .flatMap((keyword) => {
                switch (keyword) {
                  case "row":
                    return Some.of(Scope.Row);
                  case "col":
                    return Some.of(Scope.Column);
                  case "rowgroup":
                    return Some.of(Scope.RowGroup);
                  case "colgroup":
                    return Some.of(Scope.ColumnGroup);
                  default:
                    return None;
                }
              })
              .orElse(() => Some.of(Scope.Auto));

      return Ok.of(
        Builder.of(kind, x, y, colspan, rowspan, cell, None, grow, scope)
      );
    }
  }
}
