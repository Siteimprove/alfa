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
function newSlot(cell: Cell | null = null): Slot {
  return { elements: [], cell: Option.from(cell) }
}

export type Table = { slots: Array<Array<Slot>>, width: number, height: number, cells: Array<Cell>, rowGroups: Array<RowGroup>, colGroups: Array<ColGroup> };

function getSlot(table: Table, col: number, row: number): Option<Slot> {
  return Option
    .from(table.slots[col])
    .flatMap(sLine => Option.from(sLine[row]))
}

function setSlot(table: Table, col: number, row: number, slot: Slot) {
  if (table.slots[col] === undefined) table.slots[col] = [];
  table.slots[col][row] = slot;
}

export function newTable(): Table {
  return { slots: [[]], width: 0, height: 0, cells: [], rowGroups: [], colGroups: []}
}

// Bad global variables! Bad!
export const global = { yCurrent:0};


// https://html.spec.whatwg.org/multipage/tables.html#concept-cell
export type Cell = {
  kind: "data" | "header";
  // "top left" corner of the cell
  anchor: { x: number; y: number };
  // size of the cell
  width: number;
  height: number;
  growing: boolean; // true if part of the growing cells list.
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
  if (str.match(/^\s*$/)) {
    return Err.of("The string is empty");
  }
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
  return result.andThen(([_, value]) =>
    value < 0 ?
      Err.of("This is a negative number") :
      result)
}
// end micro syntaxes

// attribute helper should move to attribute
export function parseAttribute<RESULT, ERROR>(parser: Parser<string, RESULT, ERROR>): Mapper<Attribute, Result<RESULT, ERROR>> {
  return (attribute) =>
    parser(attribute.value)
      .andThen(([_, value]) => Ok.of(value));
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
function growingCell(yCurrent: number, keep: boolean = false): ((cell: Cell) => Cell) {
  // we need yCurrent to be covered, hence y+h-1>=yCurrent, hence h>=yCurrent-y+1
  return cell => ({
    ...cell,
    height: cell.growing ? Math.max(cell.height, yCurrent - cell.anchor.y + 1) : cell.height,
    growing: cell.growing && keep
  })
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

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
export function rowProcessing(table: Table, tr: Element, yCurrent: number): void {
  // 1
  if (table.height === yCurrent) {
    table.height++
  }
  // 2
   let xCurrent = 0;
  // 3
  table.cells = table.cells.map(growingCell(yCurrent, true));

  let children = tr.children().filter(isElementByName("th", "td"));
  for (const currentCell of children) { // loop control between 4-5, and 16-17-18
    // 6 (Cells)
    while (xCurrent < table.width &&
      getSlot(table, xCurrent, yCurrent)
        .flatMap(slot => slot.cell)
        .isSome()
    ) {
      xCurrent++
    }
    // 7
    if (xCurrent === table.width) {
      table.width++
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
    if (table.width <= xCurrent + colspan) {
      table.width = xCurrent + colspan
    }
    // 12
    if (table.height <= yCurrent + rowspan) {
      table.height = yCurrent + rowspan
    }
    // 13
    const cell: Cell = {
      kind: hasName(equals("th"))(currentCell) ? "header" : "data",
      anchor: {x: xCurrent, y: yCurrent},
      width: colspan,
      height: rowspan,
      // 14
      growing: grow
    };
    for (let x = xCurrent; x < xCurrent + colspan; x++) {
      for (let y = yCurrent; y < yCurrent + rowspan; y++) {
        const slot = getSlot(table, x, y);
        if (slot.flatMap(s => s.cell).isSome()) {
          throw new Error(`Slot (${x}, ${y}) is covered twice`)
        }
        if (slot.isNone() ) {
          setSlot(table, x, y, newSlot(cell));
        } else {
          slot.get().cell = Some.of(cell)
        }
      }
    }
    // Storing the element in the anchor slot only.
    table.slots[xCurrent][yCurrent].elements.push(currentCell);
    table.cells.push(cell);
    // 15
    xCurrent = xCurrent + colspan;
  }
  // 4 and 16 done after the calls.
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-ending-a-row-group
export function endRowGroup(table: Table, height: number) {
  // 1, growingCells can grow by more than 1 at a time.
  table.cells = table.cells.map(growingCell(height));
  // 2
  global.yCurrent = height;
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
export function processRowGroup(table: Table, group: Element) {
  // 1
  const yStart = table.height;
  // 2
  for (const row of group.children().filter(isElementByName("tr"))) {
    rowProcessing(table, row, global.yCurrent);
    // row processing steps 4/16
    global.yCurrent++;
  }
  // 3
  if (table.height > yStart) {
    const rowGroup = { anchor: {y: yStart}, height: table.height - yStart, element: group};
    table.rowGroups.push(rowGroup);
  }
  // 4
  endRowGroup(table, table.height);
}

// https://html.spec.whatwg.org/multipage/tables.html#forming-a-table
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

export function formingTable(element: Element): Table {
  // 1, 2, 4, 11
  const table = newTable();
  // 3
  let pendingTfoot: Array<Element> = [];
  // 5 + 8 + 9.3
  let children = element.children().filter(isElementByName("colgroup", "thead", "tbody", "tfoot", "tr"));
  // 6
  // skipping caption for now

  // 10
  global.yCurrent = 0;

  let processCG = true;
  for (const currentElement of children) { // loop control is 7 + 9.2 + 13 (advance) + 15 (advance) + 17 + 18

    switch (currentElement.name) {
      case "colgroup":
        // 9.1 (Columns group)
        if (processCG) {
          const colGroup = processColGroup(currentElement, table.width);
          // 9.1 (1).4 (cumulative) and (2).2
          table.width += colGroup.width;
          // 9.1 (1).7 and (2).3
          table.colGroups.push(colGroup);
        }
        break;
      case "tr":
        // 12
        processCG = false;
        // 13 (process)
        rowProcessing(table, currentElement, global.yCurrent);
        // row processing steps 4/16
        global.yCurrent++;
        break;
      case "tfoot":
        // 12
        processCG = false;
        // 14
        endRowGroup(table, table.height);
        // 15 (add to list)
        pendingTfoot.push(currentElement);
        break;

      case "thead":
      case "tbody":
        // 12
        processCG = false;
        // 14
        endRowGroup(table, table.height);
        // 16
        processRowGroup(table, currentElement);
        break;
      default: throw new Error("Impossible")
    }
  }
  // 19
  for (const tfoot of pendingTfoot) {
    processRowGroup(table, tfoot);
  }
  // 20
  // skipping for now, need better row/col selectors
  // 21
  return table;
}
