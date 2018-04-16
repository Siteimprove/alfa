import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Section } from "../abstract";
import { Row } from "./row";

/**
 * @see https://www.w3.org/TR/wai-aria/#cell
 */
export const Cell: Role = {
  name: "cell",
  inherits: [Section],
  context: [Row],
  supported: [
    Attributes.ColumnIndex,
    Attributes.ColumnSpan,
    Attributes.RowIndex,
    Attributes.RowSpan
  ],
  label: { from: ["contents", "author"] }
};
