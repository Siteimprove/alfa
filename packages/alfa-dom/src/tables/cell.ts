import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Predicate } from "@siteimprove/alfa-predicate";

import * as json from "@siteimprove/alfa-json";

import { Element } from "..";
import { ColGroup, RowGroup } from "./groups";
import { hasName, parseEnumeratedAttribute, parseSpan } from "./helpers";

const { equals } = Predicate;

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#concept-cell
 */
export class Cell implements Equatable, Serializable {
  private readonly _kind: "data" | "header";
  private readonly _anchor: { x: number; y: number };
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;
  private readonly _scope: Cell.HeaderState;
  // Note 1: The HTML spec makes no real difference between Cell and the element in it and seems to use the word "cell"
  //         all over the place. Storing here elements instead of Cell is easier because Elements don't change during
  //         the computation, so there is no need to either update all usages or have side effects for updating Cell.
  // Note 2: Explicit and Implicit headings are normally mutually exclusive. However, it seems that some browsers
  //         fallback to implicit headers if explicit ones refer to inexistant elements. So keeping both is safer.
  private readonly _headers: {
    explicit: Array<Element>;
    implicit: Array<Element>;
  };

  public static of(
    kind: "data" | "header",
    x: number,
    y: number,
    w: number,
    h: number,
    element: Element,
    eHeaders: Array<Element> = [],
    iHeaders: Array<Element> = []
  ): Cell {
    return new Cell(kind, x, y, w, h, element, eHeaders, iHeaders);
  }

  private constructor(
    kind: "data" | "header",
    x: number,
    y: number,
    w: number,
    h: number,
    element: Element,
    eHeaders: Array<Element>,
    iHeaders: Array<Element>
  ) {
    /**
     * @see https://html.spec.whatwg.org/multipage/tables.html#attr-th-scope
     */
    const scopeMapping = Map.from([
      ["row", Cell.HeaderState.Row],
      ["col", Cell.HeaderState.Column],
      ["rowgroup", Cell.HeaderState.RowGroup],
      ["colgroup", Cell.HeaderState.ColGroup],
      ["missing", Cell.HeaderState.Auto],
      ["invalid", Cell.HeaderState.Auto],
    ]);

    this._kind = kind;
    this._anchor = { x, y };
    this._width = w;
    this._height = h;
    this._element = element;
    this._scope = parseEnumeratedAttribute(
      "scope",
      scopeMapping
    )(element).get();
    this._headers = { explicit: eHeaders, implicit: iHeaders };
  }

  // debug
  public get name(): string {
    return this._element.attribute("id").get().value;
  }

  public get anchor(): {x: number, y: number} {
    return this._anchor;
  }
  public get width(): number {
    return this._width;
  }
  public get height(): number {
    return this._height;
  }
  public get kind(): "header" | "data" {
    return this._kind;
  }
  public get element(): Element {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return true;
  }
  public isColGroup(): this is ColGroup {
    return true;
  }

  public anchorAt(x: number, y: number): Cell {
    return Cell.of(this._kind, x, y, this._width, this._height, this._element);
  }

  /**
   * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-growing-downward-growing-cells
   */
  public growDownward(yCurrent: number): Cell {
    // we need yCurrent to be covered, hence y+h-1>=yCurrent, hence h>=yCurrent-y+1
    return Cell.of(
      this._kind,
      this._anchor.x,
      this._anchor.y,
      this._width,
      Math.max(this._height, yCurrent - this._anchor.y + 1),
      this._element
    );
  }

  /**
   * compare cell according to their anchor
   * in a given group of cells (row, rowgroup, table, …), no two different cells can have the same anchor, so this is good.
   */
  public compare(cell: Cell): number {
    if (this._anchor.y < cell._anchor.y) return -1;
    if (this._anchor.y > cell._anchor.y) return 1;
    if (this._anchor.x < cell._anchor.x) return -1;
    if (this._anchor.x > cell._anchor.x) return 1;
    return 0;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Cell &&
      this._kind === value._kind &&
      this._width === value._width &&
      this._height === value._height &&
      this._anchor.x === value._anchor.x &&
      this._anchor.y === value._anchor.y &&
      this._element.equals(value._element)
    );
  }

  public toJSON(): Cell.JSON {
    return {
      kind: this._kind,
      anchor: this._anchor,
      width: this._width,
      height: this._height,
      element: this._element.toJSON(),
    };
  }

  public toString(): string {
    return `Cell (${this._kind}) anchor: (${this._anchor.x}, ${this._anchor.y}), width: ${this._width}, height: ${this._height}, element: ${this._element}`;
  }
}

export namespace Cell {
  export interface JSON {
    [key: string]: json.JSON;
    kind: "header" | "data";
    anchor: { x: number; y: number };
    width: number;
    height: number;
    element: Element.JSON;
  }

  export enum HeaderState {
    Auto,
    Row,
    Column,
    RowGroup,
    ColGroup,
  }

  /**
   * @see https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
   */
  export function from(
    cell: Element,
    x: number = -1,
    y: number = -1
  ): { cell: Cell; downwardGrowing: boolean } {
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
    return {
      cell: Cell.of(
        hasName(equals("th"))(cell) ? "header" : "data",
        x,
        y,
        colspan,
        rowspan,
        cell
      ),
      downwardGrowing: grow,
    };
  }
}
