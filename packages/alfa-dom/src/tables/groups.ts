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

export function isCoveringClass(x: number, y: number): Predicate<RowGroup | ColGroup> {
  function covering(cover: RowGroup | ColGroup) {
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

export function isCovering(x: number, y: number): Predicate<Cell> {
  function covering(cover: Cell) {
    if ("width" in cover) { // Cell or Col
      if (x < cover.anchor.x) { // slot is left of cover
        return false;
      }
      if (cover.anchor.x + cover.width - 1 < x) { // slot is right of cover
        return false;
      }
    }

    if ("height" in cover) { // Cell or Row
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

// https://html.spec.whatwg.org/multipage/tables.html#concept-cell
export type Cell = {
  kind: "data" | "header";
  // "top left" corner of the cell
  anchor: { x: number; y: number };
  // size of the cell
  width: number;
  height: number;
  element: Element;
}
