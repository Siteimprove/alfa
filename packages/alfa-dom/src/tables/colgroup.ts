import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

import { Element } from "..";
import { isElementByName, parseSpan } from "./helpers";
import { RowGroup } from "./groups";

import assert = require("assert");

/**
 * @see https://html.spec.whatwg.org/multipage/tables.html#concept-column-group
 */
export class ColGroup implements Equatable, Serializable {
  private readonly _anchor: { x: number };
  private readonly _width: number;
  private readonly _element: Element;

  public static of(x: number, width: number, element: Element): ColGroup {
    return new ColGroup(x, width, element);
  }

  private constructor(x: number, width: number, element: Element) {
    this._anchor = { x };
    this._width = width;
    this._element = element;
  }

  public get anchor(): {x: number} {
    return this._anchor;
  }
  public get width(): number {
    return this._width;
  }
  public get element(): Element {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return false;
  }
  public isColGroup(): this is ColGroup {
    return true;
  }
  public anchorAt(x: number): ColGroup {
    return ColGroup.of(x, this._width, this._element);
  }

  /**
   * compare colgroups according to their anchor
   * in a given group of colgroups (table), no two different colgroups can have the same anchor, so this is good.
   */
  public compare(colgroup: ColGroup): number {
    if (this._anchor.x < colgroup._anchor.x) return -1;
    if (this._anchor.x > colgroup._anchor.x) return 1;
    return 0;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof ColGroup &&
      this._width === value._width &&
      this._anchor.x === value._anchor.x &&
      this._element.equals(value._element)
    );
  }

  public toJSON(): ColGroup.JSON {
    return {
      anchor: this._anchor,
      width: this._width,
      element: this._element.toJSON(),
    };
  }

  public toString(): string {
    return `ColGroup anchor: ${this._anchor.x}, width: ${this._width}, element: ${this._element}`;
  }
}

export namespace ColGroup {
  export interface JSON {
    [key: string]: json.JSON;
    anchor: { x: number };
    width: number;
    element: Element.JSON;
  }

  /**
   * @see https://html.spec.whatwg.org/multipage/tables.html#forming-a-table
   * global step 9.1
   */
  export function from(colgroup: Element, x: number = -1): ColGroup {
    assert(colgroup.name === "colgroup");
    let children = colgroup.children().filter(isElementByName("col"));
    let totalSpan = 0;
    if (children.isEmpty()) {
      // second case
      // 1
      totalSpan = parseSpan(colgroup, "span", 1, 1000, 1);
    } else {
      // first case
      // 1
      for (const currentCol of children) {
        // loop control is 2 and 6
        // 3 (Columns)
        const span = parseSpan(currentCol, "span", 1, 1000, 1);
        totalSpan += span;
        // 5
        // The col element represents column within the colgroup but is not a colgroup itself. The rest of the algorithm seems to never use that again…
        // const colGroup: ColGroup = { anchor: {x: global.theTable.width - span}, width: span, element: currentCol}; // need better name! Technically not a "column group"…
        // global.theTable.colGroups.push(colGroup);
      }
    }
    // 1.4 and 1.7 done in main function
    // 2.2 and 2.3 done in main function
    return ColGroup.of(x, totalSpan, colgroup);
  }
}
