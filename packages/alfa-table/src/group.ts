import { Refinement } from "@siteimprove/alfa-refinement";

import { Column } from "./column";
import { Row } from "./row";

const { or } = Refinement;

export type Group = Column.Group | Row.Group;

export namespace Group {
  export type JSON = Column.Group.JSON | Row.Group.JSON;

  export const { isGroup: isColumn } = Column;

  export const { isGroup: isRow } = Row;

  export const isGroup = or(isColumn, isRow);
}
