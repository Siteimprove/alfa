// https://html.spec.whatwg.org/multipage/tables.html#concept-column-group
import {Element} from "..";
import {isElementByName, parseSpan} from "./helpers";
import { RowGroup } from "./groups";

import assert = require("assert");

export class ColGroup {
  private readonly _anchor: {x: number};
  private readonly _width: number;
  private readonly _element: Element;

  constructor(x: number, width: number, element: Element) {
    this._anchor = { x };
    this._width = width;
    this._element = element;
  }

  public get anchor() {
    return this._anchor;
  }
  public get width() {
    return this._width;
  }
  public get element() {
    return this._element;
  }

  public isRowGroup(): this is RowGroup {
    return false;
  }
  public isColGroup(): this is ColGroup {
    return true;
  }
  public anchorAt(x: number): ColGroup {
    return new ColGroup(x, this._width, this._element);
  }

  // https://html.spec.whatwg.org/multipage/tables.html#forming-a-table
  // global step 9.1
  public static of(colgroup: Element): ColGroup {
    assert(colgroup.name === "colgroup");
    let children = colgroup.children().filter(isElementByName("col"));
    let totalSpan = 0;
    if (children.isEmpty()) { // second case
      // 1
      totalSpan = parseSpan(colgroup, "span", 1, 1000, 1);
    } else { // first case
      // 1
      for (const currentCol of children) { // loop control is 2 and 6
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
    return new ColGroup(-1, totalSpan, colgroup);
  }

}
