import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Section } from "../abstract";
import { Row, RowGroup } from "../structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#table
 */
export const Table: Role = {
  name: "table",
  label: { from: ["author"], required: true },
  inherits: [Section],
  owned: [Row, [RowGroup, Row]],
  supported: [Attributes.ColumnCount, Attributes.RowCount]
};
