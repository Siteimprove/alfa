import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Section } from "../abstract/section";
import { Row } from "./row";
import { RowGroup } from "./row-group";

/**
 * @see https://www.w3.org/TR/wai-aria/#table
 */
export const Table: Role = {
  name: "table",
  inherits: () => [Section],
  owned: () => [Row, [RowGroup, Row]],
  supported: () => [Attributes.ColumnCount, Attributes.RowCount],
  label: { from: ["author"], required: true }
};
