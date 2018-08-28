import { Category, Role } from "../../types";
import { Window } from "../abstract/window";

/**
 * @see https://www.w3.org/TR/wai-aria/#dialog
 */
export const Dialog: Role = {
  name: "dialog",
  category: Category.Window,
  inherits: () => [Window],
  label: { from: ["author"], required: true }
};
