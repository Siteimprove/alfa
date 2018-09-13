import { Category, Role } from "../../types";
import { Section } from "../abstract/section";

/**
 * @see https://www.w3.org/TR/wai-aria/#tabpanel
 */
export const TabPanel: Role = {
  name: "tabpanel",
  category: Category.Widget,
  inherits: () => [Section],
  label: { from: ["author"], required: true }
};
