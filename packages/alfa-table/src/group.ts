import { Refinement } from "@siteimprove/alfa-refinement";

import { Column } from "./column.js";
import { Row } from "./row.js";

const { or } = Refinement;

/**
 * @public
 */
export type Group = Column.Group | Row.Group;

/**
 * @public
 */
export namespace Group {
  export type JSON = Column.Group.JSON | Row.Group.JSON;

  export const { isGroup: isColumn } = Column;

  export const { isGroup: isRow } = Row;

  export const isGroup = or(isColumn, isRow);
}
