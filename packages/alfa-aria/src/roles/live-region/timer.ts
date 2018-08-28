import { Category, Role } from "../../types";
import { Status } from "./status";

/**
 * @see https://www.w3.org/TR/wai-aria/#timer
 */
export const Timer: Role = {
  name: "timer",
  category: Category.LiveRegion,
  inherits: () => [Status],
  label: { from: ["author"], required: true }
};
