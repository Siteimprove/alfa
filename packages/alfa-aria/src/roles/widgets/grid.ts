import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Composite } from "../abstract/composite";
import { Table } from "../structure/table";
import { Row } from "../structure/row";
import { RowGroup } from "../structure/row-group";

/**
 * @see https://www.w3.org/TR/wai-aria/#grid
 */
export const Grid: Role = {
  name: "grid",
  inherits: () => [Composite, Table],
  owned: () => [Row, [RowGroup, Row]],
  supported: () => [
    Attributes.Level,
    Attributes.Multiselectable,
    Attributes.ReadOnly
  ],
  label: { from: ["author"], required: true }
};
