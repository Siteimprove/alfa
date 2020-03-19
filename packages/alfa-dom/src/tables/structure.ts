import { Iterable } from "@siteimprove/alfa-iterable";
import {Mapper} from "@siteimprove/alfa-mapper";
import {clamp} from "@siteimprove/alfa-math";
import {Parser} from "@siteimprove/alfa-parser";
import {Predicate} from "@siteimprove/alfa-predicate";
import {Reducer} from "@siteimprove/alfa-reducer";
import {Err, Ok, Result} from "@siteimprove/alfa-result";
import {Set} from "@siteimprove/alfa-set";
import {Attribute, Element, Namespace, Node} from "..";

const { and, equals, property } = Predicate;

// https://html.spec.whatwg.org/multipage/tables.html#table-processing-model
export type Table = { width: number, height: number, cells: Set<Cell>, rowGroups: Array<RowGroup>, colGroups: Array<ColGroup> };
export function newTable(): Table {
  return { width: 0, height: 0, cells: Set.empty(), rowGroups: [], colGroups: []}
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

export function isCovering(x: number, y: number): Predicate<RowGroup | ColGroup> {
  function covering(cover: RowGroup | ColGroup) {
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
};

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

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-growing-downward-growing-cells
function growingCell(yCurrent: number): ((cell: Cell) => Cell) {
  // we need yCurrent to be covered, hence y+h-1>=yCurrent, hence h>=yCurrent-y+1
  return cell => ({
    ...cell,
    height: Math.max(cell.height, yCurrent - cell.anchor.y + 1)
  })
}

function growCellInSet(yCurrent: number): Reducer<Cell, Set<Cell>> {
  return (set: Set<Cell>, cell: Cell) =>
    set.delete(cell).add(growingCell(yCurrent)(cell));
}

const growCellList = (yCurrent: number) => (cells: Iterable<Cell>, set: Set<Cell>) =>
  Iterable.reduce<Cell, Set<Cell>>(cells, growCellInSet(yCurrent), set);

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-rows
export function rowProcessing(table: Table, tr: Element, yCurrent: number, growingCellsList: Array<Cell>): Array<Cell> {
  // 1
  if (table.height === yCurrent) {
    table.height++
  }
  // 2
   let xCurrent = 0;
  // 3
  table.cells = growCellList(yCurrent)(growingCellsList, table.cells);

  let children = tr.children().filter(isElementByName("th", "td"));
  for (const currentCell of children) { // loop control between 4-5, and 16-17-18
    // 6 (Cells)
    while (xCurrent < table.width &&
      table.cells.find(isCovering(xCurrent, yCurrent)).isSome()
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
      element: currentCell
    };
    for (let x = xCurrent; x < xCurrent + colspan; x++) {
      for (let y = yCurrent; y < yCurrent + rowspan; y++) {
        if (table.cells.find(isCovering(x, y)).isSome()) {
          throw new Error(`Slot (${x}, ${y}) is covered twice`)
        }
      }
    }
    table.cells = table.cells.add(cell);
    // 14
    if (grow) growingCellsList.push(cell);
    // 15
    xCurrent = xCurrent + colspan;
  }
  return growingCellsList;
  // 4 and 16 done after the calls to avoid side effects.
}

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-ending-a-row-group
// export function endRowGroup(table: Table): void {
//   // 1.1, growingCells can grow by more than 1 at a time.
//   table.cells.forEach(growingCell(table.height,false));
//   // 1.2 done after call
// }

// https://html.spec.whatwg.org/multipage/tables.html#algorithm-for-processing-row-groups
export function processRowGroup(table: Table, group: Element, yCurrent: number): number {
  let growingCellsList: Array<Cell> = [];
  // 1
  const yStart = table.height;
  // 2
  for (const row of group.children().filter(isElementByName("tr"))) {
    growingCellsList = rowProcessing(table, row, yCurrent, growingCellsList); // uses yCurrent to modify table.height ! Modify table.width !
    // row processing steps 4/16
    yCurrent++;
  }
  // 3
  if (table.height > yStart) {
    const rowGroup = { anchor: {y: yStart}, height: table.height - yStart, element: group};
    table.rowGroups.push(rowGroup);
  }
  // 4
  // ending row group 1
  table.cells = growCellList(table.height)(growingCellsList, table.cells);
  // ending row group 2 is needless because growing cell list is local.
  return table.height;
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
  let yCurrent = 0;

  // 11
  let growingCellsList: Array<Cell> = [];

  let processCG = true;
  for (const currentElement of children) { // loop control is 7 + 9.2 + 13 (advance) + 15 (advance) + 17 + 18

    if (currentElement.name === "colgroup") {
      // 9.1 (Columns group)
      if (processCG) {
        const colGroup = processColGroup(currentElement, table.width);
        // 9.1 (1).4 (cumulative) and (2).2
        table.width += colGroup.width;
        // 9.1 (1).7 and (2).3
        table.colGroups.push(colGroup);
      }
      continue;
    }

    // 12
    processCG = false;

    if (currentElement.name === "tr") {
      // 13 (process)
      growingCellsList = rowProcessing(table, currentElement, yCurrent, growingCellsList);
      // row processing steps 4/16
      yCurrent++;
      continue;
    }

    // 14
    // Ending row group 1
    table.cells = growCellList(table.height)(growingCellsList, table.cells);
    yCurrent = table.height;
    // Ending row group 2
    growingCellsList = [];

    if (currentElement.name === "tfoot") {
      // 15 (add to list)
      pendingTfoot.push(currentElement);
    }

    if (currentElement.name === "thead" || currentElement.name === "tbody") {
      // 16
      yCurrent = processRowGroup(table, currentElement, yCurrent);
    }
  }

  // 19
  for (const tfoot of pendingTfoot) {
    yCurrent = processRowGroup(table, tfoot, yCurrent);
  }
  // 20
  // skipping for now, need better row/col selectors
  // 21
  return table;
}
