import {Predicate} from "@siteimprove/alfa-predicate";
import {Element} from "..";

// https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
export class RowGroup {
  private readonly _anchor: {y: number};
  private readonly _height: number;
  private readonly _element: Element;

  constructor(y: number, height: number, element: Element) {
    this._anchor = { y };
    this._height = height;
    this._element = element;
  }

  get anchor() {
    return this._anchor;
  }
  get height() {
    return this._height;
  }
  get element() {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return true;
  }
  public isColGroup(): this is ColGroup {
    return false;
  }
}


// https://html.spec.whatwg.org/multipage/tables.html#concept-column-group
export class ColGroup {
  private readonly _anchor: {x: number};
  private readonly _width: number;
  private readonly _element: Element;

  constructor(x: number, width: number, element: Element) {
    this._anchor = { x };
    this._width = width;
    this._element = element;
  }

  get anchor() {
    return this._anchor;
  }
  get width() {
    return this._width;
  }
  get element() {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return false;
  }
  public isColGroup(): this is ColGroup {
    return true;
  }
}

// https://html.spec.whatwg.org/multipage/tables.html#concept-cell
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

  get anchor() {
    return this._anchor;
  }
  get width() {
    return this._width;
  }
  get height() {
    return this._height;
  }

  public isRowGroup(): this is RowGroup {
    return true;
  }
  public isColGroup(): this is ColGroup {
    return true;
  }

  // https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-growing-downward-growing-cells
  public growDownward(yCurrent: number): Cell {
    // we need yCurrent to be covered, hence y+h-1>=yCurrent, hence h>=yCurrent-y+1
    return new Cell(this._kind, this._anchor.x, this._anchor.y, this._width, Math.max(this._height, yCurrent - this._anchor.y + 1), this._element);
  }

}

export function isCovering(x: number, y: number): Predicate<Cell | RowGroup | ColGroup> {
  function covering(cover: Cell | RowGroup | ColGroup) {
    if (cover.isColGroup()) { // Cell or Col
      if (x < cover.anchor.x) { // slot is left of cover
        return false;
      }
      if (cover.anchor.x + cover.width - 1 < x) { // slot is right of cover
        return false;
      }
    }

    if (cover.isRowGroup()) { // Cell or Row
      if (y < cover.anchor.y) { // slot is above cover
        return false;
      }
      if (cover.anchor.y + cover.height - 1 < y) { // slot is below cover
        return false;
      }
    }

    return true;
  }
  return covering;
}
