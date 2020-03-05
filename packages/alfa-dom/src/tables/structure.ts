import {Mapper} from "@siteimprove/alfa-mapper";
import {clamp} from "@siteimprove/alfa-math";
import {None, Option, Some} from "@siteimprove/alfa-option";
import {Parser} from "@siteimprove/alfa-parser";
import {Predicate} from "@siteimprove/alfa-predicate";
import {Iterable} from "@siteimprove/alfa-iterable";
import {Err, Ok, Result} from "@siteimprove/alfa-result";
import {test} from "@siteimprove/alfa-test";
import {Attribute, Element, Namespace, Node} from "..";
import isElement = Element.isElement;

const { and, equals, property } = Predicate;

// https://html.spec.whatwg.org/multipage/tables.html#table-processing-model

export type Slot = { elements: Array<Element>, cell: Option<Cell> };

export type Table = { slots: Array<Array<Slot>>, width: number, height: number, cells: Array<Cell>, rowGroups: Array<RowGroup>, colGroups: Array<ColGroup> };

// https://html.spec.whatwg.org/multipage/tables.html#concept-cell
export type Cell = {
  kind: "data" | "header";
  // "top left" corner of the cell
  anchor: { x: number; y: number };
  // size of the cell
  width: number;
  height: number;
}

// https://html.spec.whatwg.org/multipage/tables.html#concept-row-group
export type RowGroup = {
  // First row of the group
  anchor: { y: number };
  height: number;
  element: Element;
}

// https://html.spec.whatwg.org/multipage/tables.html#concept-column-group
export type ColGroup = {
  // First column of the group
  anchor: { x: number };
  width: number;
  element: Element;
}

// export const isCoveredBy: Predicate<Slot, Slot, Array<Cell | RowGroup | ColGroup>> = (slot, cover) => {
//   if ("width" in cover) { // Cell or Col
//     if (slot.x < cover.anchor.x) { // slot is left of cover
//       return false;
//     }
//     if (cover.anchor.x + cover.width - 1 < slot.x) { // slot is right of cover
//       return false;
//     }
//   }
//
//   if ("height" in cover) { // Cell or Row
//     if (slot.y < cover.anchor.y) { // slot is above cover
//       return false;
//     }
//     if (cover.anchor.y + cover.height - 1 < slot.y) { // slot is below cover
//       return false;
//     }
//   }
//
//   return true;
// };

// micro syntaxes to move to alfa-parser
// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#signed-integers
export function parseInteger(str: string): Result<readonly [string, number], string> {
  // empty/whitespace string are errors for specs, not for Number…
  // \s seems to be close enough to "ASCII whitespace".
  if (str.match(/^\s*$/)) return Err.of("The string is empty");
  const raw = Number(str);
  return isNaN(raw) ?
    Err.of("The string does not represent a number") :
    raw !== Math.floor(raw) ?
      Err.of("The string does not represent an integer") :
      // 0 and -0 are different (but equal…) floats. Normalising.
      Ok.of(["", raw === -0 ? 0 : raw] as const);
}

// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#rules-for-parsing-non-negative-integers
export function parseNonNegativeInteger(str: string): Result<readonly [string, number], string> {
  const result = parseInteger(str);
  if (result.isErr()) return result;
  const [_, value] = result.get();
  return value < 0 ?
      Err.of("This is a negative number") :
      result;
}
// end micro syntaxes

// attribute helper should move to attribute
export function parseAttribute<RESULT, ERROR>(parser: Parser<string, RESULT, ERROR>): Mapper<Attribute, Result<RESULT, ERROR>> {
  return (attribute) => {
    const result = parser(attribute.value);
    if (result.isErr()) return result;
    const [_, value] = result.get();
    return Ok.of(value);
  }
}
// end attribute helper

export function parseSpan(element: Element, name: string, min: number, max: number, failed: number): number {
  return element.attribute(name)
    .map(parseAttribute(parseNonNegativeInteger))
    .map(r => r.map(x => clamp(x, min, max)))
    .getOr(Ok.of(failed))
    .getOr(failed);
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-growing-downward-growing-cells
function growingCell(cell: Cell, yCurrent: number):void {
  // we need yCurrent to be covered, hence y+h-1>=yCurrent, hence h>=yCurrent-y+1
  cell.height = Math.max(cell.height, yCurrent - cell.anchor.y + 1);
}

function growingCells(cells: Array<Cell>, yCurrent: number):void {
  cells.forEach(cell => growingCell(cell, yCurrent));
}

// Bad copy from rule helpers. Move to DOM helpers?
function hasNamespace(
  predicate: Predicate<Namespace> = () => true
): Predicate<Element> {
  return element => element.namespace.some(predicate);
}

function hasName<T extends { readonly name: string }>(
  predicate: Predicate<string> = () => true
): Predicate<T> {
  return property("name", predicate);
}
// end copied from rule

function isElementByName(...names: Array<string>): Predicate<Node, Element> {
  return and(Element.isElement,
    and(hasNamespace(equals(Namespace.HTML)),
      hasName(equals(...names))
    ));
}

// Bad global variables! Bad!
export const global = {xCurrent:0, yCurrent:0, growingCellsList: [] as Array<Cell>,
  theTable: { slots: [[]] as Array<Array<Slot>>, width: 0, height: 0, cells: [] as Array<Cell>, rowGroups: [] as Array<RowGroup>, colGroups: [] as Array<ColGroup> } as Table};

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
export function rowProcessing(tr: Element): void {
  // 1
  if (global.theTable.height === global.yCurrent) {
    global.theTable.height++
  }
  // 2
  global.xCurrent = 0;
  // 3
  growingCells(global.growingCellsList, global.yCurrent);

  let children = tr.children().filter(isElementByName("th", "td"));
  for (const currentCell of children) { // loop control between 4-5, and 16-17-18
    // 6 (Cells)
    while (global.xCurrent < global.theTable.width && global.theTable.slots[global.xCurrent][global.yCurrent].cell.isSome()) {
      global.xCurrent++
    }
    // 7
    if (global.xCurrent === global.theTable.width) {
      global.theTable.width++
    }
    // 8
    const colspan = parseSpan(currentCell, "colspan", 1, 1000, 1);
    // 9
    let rowspan = parseSpan(currentCell, "rowspan", 0, 65534, 1);
    // 10 assuming we are not in quirks mode because I don't know if we test that yet…
    const grow = (rowspan === 0);
    if (rowspan === 0) {
      rowspan = 1
    }
    // 11
    if (global.theTable.width <= global.xCurrent + colspan) {
      global.theTable.width = global.xCurrent + colspan
    }
    // 12
    if (global.theTable.height <= global.yCurrent + rowspan) {
      global.theTable.height = global.yCurrent + rowspan
    }
    // 13
    const cell: Cell = {
      kind: hasName(equals("th"))(currentCell) ? "header" : "data",
      anchor: {x: global.xCurrent, y: global.yCurrent},
      width: colspan,
      height: rowspan
    };
    for (let x = global.xCurrent; x < global.xCurrent + colspan; x++) {
      for (let y = global.yCurrent; y < global.yCurrent + rowspan; y++) {
        const slot = global.theTable.slots[x][y];
        if (slot.cell.isSome()) {
          throw new Error(`Slot (${x}, ${y}) is covered twice`)
        }
        slot.cell = Some.of(cell);
      }
    }
    // Storing the element in the anchor slot only.
    global.theTable.slots[global.xCurrent][global.yCurrent].elements.push(currentCell);
    global.theTable.cells.push(cell);
    // 14
    if (grow) {
      global.growingCellsList.push(cell);
    }
    // 15
    global.xCurrent = global.xCurrent + colspan;
  }
  // 4 and 16
  global.yCurrent++;
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-ending-a-row-group
export function endRowGroup() {
  // 1
  while (global.yCurrent < global.theTable.height) {
    // 1.1
    growingCells(global.theTable.cells, global.yCurrent);
    // 1.2
    global.yCurrent ++;
  }
  // 2
  global.growingCellsList = [];
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
export function processRowGroup(group: Element) {
  // 1
  const yStart = global.theTable.height;
  // 2
  for (const row of group.children().filter(isElementByName("tr"))) {
    rowProcessing(row);
  }
  // 3
  if (global.theTable.height > yStart) {
    const rowGroup = { anchor: {y: yStart}, height: global.theTable.height - yStart, element: group};
    global.theTable.rowGroups.push(rowGroup);
  }
  // 4
  endRowGroup();
}

// https://html.spec.whatwg.org/multipage/tables.html#forming-a-table
export function endFormingTable(pendingTfoot: Iterable<Element>) {
  // 19
  for (const tfoot of pendingTfoot) {
    processRowGroup(tfoot);
  }
  // 20
  // skipping for now, need better row/col selectors
  // 21
  return;
}

export function processColGroup(colgroup: Element, xStart: number): ColGroup { // global step 9.1
  let children = colgroup.children().filter(isElementByName("col"));
  if (children.isEmpty()) { // second case
    // 1
    const span = parseSpan(colgroup, "span", 1, 1000, 1);
    // 2 and 3 done in main function
    return { anchor: { x: xStart }, width: span, element: colgroup }
  } else { // first case
    // 1
    let totalSpan = 0;
    for (const currentCol of children) { // loop control is 2 and 6
      // 3 (Columns)
      const span = parseSpan(currentCol, "span", 1, 1000, 1);
      totalSpan += span;
      // 5
      // The col element represents column within the colgroup but is not a colgroup itself. The rest of the algorithm seems to never use that again…
      // const colGroup: ColGroup = { anchor: {x: global.theTable.width - span}, width: span, element: currentCol}; // need better name! Technically not a "column group"…
      // global.theTable.colGroups.push(colGroup);
    }
    // 4 and 7 done in main function
    return { anchor: { x: xStart }, width: totalSpan, element: colgroup };
  }
}

export function formingTable(table: Element) {
  // 1
  global.theTable.width = 0;
  // 2
  global.theTable.height = 0;
  // 3
  let pendingTfoot: Array<Element> = [];
  // 4
  // the table is global.theTable
  // 5 + 8 + 9.3
  let children = table.children().filter(isElementByName("colgroup", "thead", "tbody", "tfoot", "tr"));
  // 6
  // skipping caption for now

  // 10
  global.yCurrent = 0;
  // 11
  global.growingCellsList = [];

  let processCG = true;
  for (const currentElement of children) { // 7 + 9.2 + 13 (advance) + 15 (advance) + 17 + 18

    switch (currentElement.name) {
      case "colgroup":
        // 9.1 (Columns group)
        if (processCG) {
          const colGroup = processColGroup(currentElement, global.theTable.width);
          // 9.1 (1).4 (cumulative) and (2).2
          global.theTable.width += colGroup.width;
          // 9.1 (1).7 and (2).3
          global.theTable.colGroups.push(colGroup);
        }
        break;
      case "tr":
        // 12
        processCG = false;
        // 13 (process)
        rowProcessing(currentElement);
        break;
      case "tfoot":
        // 12
        processCG = false;
        // 14
        endRowGroup();
        // 15 (add to list)
        pendingTfoot.push(currentElement);
        break;

      case "thead":
      case "tbody":
        // 12
        processCG = false;
        // 14
        endRowGroup();
        // 16
        processRowGroup(currentElement);
        break;
      default: throw new Error("Impossible")
    }
  }
  // 19-21
  return endFormingTable(pendingTfoot);
}
