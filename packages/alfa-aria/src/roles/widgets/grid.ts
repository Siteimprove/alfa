import * as Attributes from "../../attributes";
import { Category, Role } from "../../types";
import { Composite } from "../abstract/composite";
import { Row } from "../structure/row";
import { RowGroup } from "../structure/row-group";
import { Table } from "../structure/table";

/**
 * @see https://www.w3.org/TR/wai-aria/#grid
 */
export const Grid: Role = {
  name: "grid",
  category: Category.Widget,
  inherits: () => [Composite, Table],
  owned: () => [Row, [RowGroup, Row]],
  supported: () => [
    Attributes.Level,
    Attributes.Multiselectable,
    Attributes.ReadOnly
  ],
  label: { from: ["author"], required: true }
};
