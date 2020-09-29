import { Comparable, Comparison } from "@siteimprove/alfa-comparable";
import { Element, Namespace } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Serializable } from "@siteimprove/alfa-json";
import { List } from "@siteimprove/alfa-list";
import { None, Option, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";

import * as json from "@siteimprove/alfa-json";

import { Scope } from "./scope";
import { parseSpan } from "./helpers";

const { equals, not } = Predicate;
const { and } = Refinement;
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
    headers: Iterable<Element> = List.empty()
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
  private readonly _headers: List<Element>;

  private constructor(
    kind: Cell.Kind,
    x: number,
    y: number,
    width: number,
    height: number,
    element: Element,
    scope: Option<Scope.Resolved>,
    headers: Iterable<Element>
  ) {
    this._kind = kind;
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._element = element;
    this._scope = scope;
    this._headers = List.from(headers);
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
      headers: this._headers.toArray().map((header) => header.toJSON()),
    };
  }
}

export namespace Cell {
  import compare = Comparable.compare;

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
    private readonly _cell: Cell;
    private readonly _downwardGrowing: boolean;
    // This is the scope attribute, once correctly parsed.
    // The actual variant of the header is stored in the cell and can only be computed once the table is built.
    private readonly _scope: Option<Scope>;
    // Note 1: The HTML spec makes no real difference between Cell and the element in it and seems to use the word "cell"
    //         all over the place. Storing here elements instead of Cell is easier as it never changes.
    // Note 2: Explicit and Implicit headings are normally mutually exclusive. However, it seems that some browsers
    //         fallback to implicit headers if explicit ones refer to inexistant elements. So keeping both is safer.
    //         Currently not exposing both to final cell, but easy to do if needed.
    // Note 3: Headers are empty when building the cell, they are filled in once the table is built because we need
    //         to know the full table in order to find both explicit and implicit headers.
    private readonly _explicitHeaders: List<Element>;
    private readonly _implicitHeaders: List<Element>;

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
      explicitHeaders: Iterable<Element> = List.empty(),
      implicitHeaders: Iterable<Element> = List.empty()
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
      explicitHeaders: Iterable<Element>,
      implicitHeaders: Iterable<Element>
    ) {
      this._cell = Cell.of(
        kind,
        x,
        y,
        width,
        height,
        element,
        variant,
        List.empty()
      );
      this._downwardGrowing = downwardGrowing;
      this._scope = scope;
      this._explicitHeaders = List.from(explicitHeaders);
      this._implicitHeaders = List.from(implicitHeaders);
    }

    private _update({
      kind = this.kind,
      x = this.anchor.x,
      y = this.anchor.y,
      width = this.width,
      height = this.height,
      element = this.element,
      variant = this.variant,
      downwardGrowing = this._downwardGrowing,
      scope = this.scope,
      explicitHeaders = this._explicitHeaders,
      implicitHeaders = this._implicitHeaders,
    }: {
      kind?: Cell.Kind;
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      element?: Element;
      variant?: Option<Scope.Resolved>;
      downwardGrowing?: boolean;
      scope?: Option<Scope>;
      explicitHeaders?: Iterable<Element>;
      implicitHeaders?: Iterable<Element>;
    }): Builder {
      return Builder.of(
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

    public get explicitHeaders(): Iterable<Element> {
      return this._explicitHeaders;
    }

    public get implicitHeaders(): Iterable<Element> {
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
    private _scopeToState(
      scope: Scope,
      dataInColumns: boolean, // Is there a data cell in the columns covered by this?
      dataInRows: boolean // Is there a data cell in the rows covered by this?
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
          if (dataInRows) {
            // there are *SOME* data cells in any of the cells covering slots with y-coordinates y .. y+height-1.
            if (dataInColumns) {
              // there are *SOME* data cells in any of the cells covering slots with x-coordinates x .. x+width-1.
              return None;
            } else {
              // there are *NO* data cells in any of the cells covering slots with x-coordinates x .. x+width-1.
              return Option.of(Scope.Row);
            }
          } else {
            // there are *NO* data cells in any of the cells covering slots with y-coordinates y .. y+height-1.
            return Option.of(Scope.Column);
          }
      }
    }

    public addHeaderVariant(
      dataInColumns: boolean, // Is there a data cell in the columns covered by this?
      dataInRows: boolean // Is there a data cell in the rows covered by this?
    ): Builder {
      return this._update({
        variant: this._scope.flatMap((scope) =>
          this._scopeToState(scope, dataInColumns, dataInRows)
        ),
      });
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#internal-algorithm-for-scanning-and-assigning-header-cells
     */
    private _internalHeaderScanning(
      cover: (x: number, y: number) => Option<Builder>,
      initialX: number,
      initialY: number,
      decreaseX: boolean
    ): List<Builder> {
      // The principal cell is this.
      const deltaX = decreaseX ? -1 : 0;
      const deltaY = decreaseX ? 0 : -1;
      let headersList: List<Builder> = List.empty(); // new headers found by this algorithm

      // 3
      let opaqueHeaders: List<Builder> = List.empty();
      // 4
      let inHeaderBlock = false;
      let headersFromCurrentBlock: List<Builder> = List.empty();
      if (this.kind === Cell.Kind.Header) {
        inHeaderBlock = true;
        headersFromCurrentBlock = headersFromCurrentBlock.append(this);
      }

      // 1, 2, 5, 6, 10
      for (
        let x = initialX + deltaX, y = initialY + deltaY;
        x >= 0 && y >= 0;
        x += deltaX, y += deltaY
      ) {
        // 7
        const covering = cover(x, y);
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
          headersFromCurrentBlock = headersFromCurrentBlock.append(currentCell);
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
          if (!blocked) {
            headersList = headersList.append(currentCell);
          }
        }
        if (currentCell.kind === Cell.Kind.Data && inHeaderBlock) {
          inHeaderBlock = false;
          opaqueHeaders = opaqueHeaders.concat(headersFromCurrentBlock);
          headersFromCurrentBlock = List.empty();
        }
      }

      return headersList;
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
     */
    private _assignExplicitHeaders(table: Element): Cell.Builder {
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
                  .some(equals(table)),
              // Remove principal cell
              not(equals(this.element)),
              // Remove empty cells
              not((element) => element.children().isEmpty())
            )
          )
        );

      return this._update({ explicitHeaders: elements });
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
     */
    private _assignImplicitHeaders(
      cover: (x: number, y: number) => Option<Builder>,
      getAboveLeftRowGroupHeaders: (
        principalCell: Builder
      ) => Iterable<Builder>,
      getAboveLeftColumnGroupHeaders: (
        principalCell: Builder
      ) => Iterable<Builder>
    ): Builder {
      // 1
      let headersSet: Set<Builder> = Set.empty();
      // 2 principal cell = this, nothing to do.
      // 3 / no header attribute (3.1, 3.2: use this)
      // 3.3: find row headers in the row(s) covered by the principal cell
      for (let y = this.anchor.y; y < this.anchor.y + this.height; y++) {
        headersSet = headersSet.concat(
          this._internalHeaderScanning(cover, this.anchor.x, y, true)
        );
      }
      // 3.4: find column headers in the column(s) covered by the principal cell
      for (let x = this.anchor.x; x < this.anchor.x + this.width; x++) {
        headersSet = headersSet.concat(
          this._internalHeaderScanning(cover, x, this.anchor.y, false)
        );
      }
      // 3.5: find row group headers for the rowgroup of the principal cell
      headersSet = headersSet.concat(getAboveLeftRowGroupHeaders(this));
      // 3.6: find column group headers for the colgroup of the principal cell
      headersSet = headersSet.concat(getAboveLeftColumnGroupHeaders(this));

      headersSet = headersSet.filter(
        (cell) =>
          // 4 (remove empty cells)
          !cell.element.children().isEmpty() &&
          // 6 remove principal cell
          !cell.equals(this)
        // 5 (remove duplicates) is not needed by virtue of using set.
      );

      return this._update({
        implicitHeaders: [...headersSet]
          .sort(compare)
          .map((cell) => cell.element),
      });
    }

    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-assigning-header-cells
     */
    public assignHeaders(
      table: Element,
      cover: (x: number, y: number) => Option<Builder>,
      getAboveLeftRowGroupHeaders: (
        principalCell: Builder
      ) => Iterable<Builder>,
      getAboveLeftColumnGroupHeaders: (
        principalCell: Builder
      ) => Iterable<Builder>
    ): Cell.Builder {
      return this._assignExplicitHeaders(table)._assignImplicitHeaders(
        cover,
        getAboveLeftRowGroupHeaders,
        getAboveLeftColumnGroupHeaders
      );
    }

    public equals(value: unknown): value is this {
      return value instanceof Builder && this._cell.equals(value._cell);
    }

    public toJSON(): Cell.Builder.JSON {
      return {
        cell: this._cell.toJSON(),
        state: this._scope.toJSON(),
        explicitHeaders: this._explicitHeaders
          .toArray()
          .map((header) => header.toJSON()),
        implicitHeaders: this._implicitHeaders
          .toArray()
          .map((header) => header.toJSON()),
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
