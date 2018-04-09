import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Composite } from "../abstract";
import { Table, Row, RowGroup } from "../structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#grid
 */
export const Grid: Role = {
  name: "grid",
  inherits: [Composite, Table],
  owned: [Row, [RowGroup, Row]],
  supported: [
    Attributes.Level,
    Attributes.Multiselectable,
    Attributes.ReadOnly
  ],
  label: { from: ["author"], required: true }
};
