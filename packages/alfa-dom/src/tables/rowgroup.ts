// https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
import {Equatable} from "@siteimprove/alfa-equatable";
import {Serializable} from "@siteimprove/alfa-json";
import {Element} from "..";
import { ColGroup } from "./groups";

import * as json from "@siteimprove/alfa-json";

export class RowGroup implements Equatable, Serializable {
  private readonly _anchor: {y: number};
  private readonly _height: number;
  private readonly _element: Element;

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
    return `RowGroup anchor: ${this._anchor.y}, height: ${this._height}, element: ${this._element.toString()}`
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
