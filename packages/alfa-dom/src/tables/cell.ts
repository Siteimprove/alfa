// https://html.spec.whatwg.org/multipage/tables.html#concept-cell
import {Predicate} from "@siteimprove/alfa-predicate";
import {Element} from "..";
import {ColGroup} from "./colgroup";
import {hasName, parseSpan} from "./helpers";
import {RowGroup} from "./rowgroup";

const { equals } = Predicate;

export class Cell {
  private readonly _kind: "data" | "header";
  private readonly _anchor: { x: number, y: number };
  private readonly _width: number;
  private readonly _height: number;
  private readonly _element: Element;

  constructor(kind: "data" | "header", x: number, y: number, w: number, h: number, element: Element) {
    this._kind = kind;
    this._anchor = { x, y };
    this._width = w;
    this._height = h;
    this._element = element;
  }

  // debug
  public get name() {
    return this._element.attribute("id").get().value;
  }

  public get anchor() {
    return this._anchor;
  }
  public get width() {
    return this._width;
  }
  public get height() {
    return this._height;
  }
  public get kind() {
    return this._kind;
  }
  public get element() {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return true;
  }
  public isColGroup(): this is ColGroup {
    return true;
  }

  public anchorAt(x: number, y: number): Cell {
    return new Cell(this._kind, x, y, this._width, this._height, this._element);
  }

  // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-growing-downward-growing-cells
  public growDownward(yCurrent: number): Cell {
    // we need yCurrent to be covered, hence y+h-1>=yCurrent, hence h>=yCurrent-y+1
    return new Cell(this._kind, this._anchor.x, this._anchor.y, this._width, Math.max(this._height, yCurrent - this._anchor.y + 1), this._element);
  }

  // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
  public static of(cell: Element, x: number = -1, y: number = -1): ({cell: Cell, downwardGrowing: boolean}) {
    const colspan = parseSpan(cell, "colspan", 1, 1000, 1);
    // 9
    let rowspan = parseSpan(cell, "rowspan", 0, 65534, 1);
    // 10 assuming we are not in quirks mode because I don't know if we test that yet…
    // Unsurprisingly, "rowspan=0" is not universally supported (that is, not by Edge…)
    const grow = (rowspan === 0);
    if (rowspan === 0) {
      rowspan = 1
    }
    // 11
    return ({
      cell: new Cell(hasName(equals("th"))(cell) ? "header" : "data", x, y, colspan, rowspan, cell),
      downwardGrowing: grow
    });
  }
}
