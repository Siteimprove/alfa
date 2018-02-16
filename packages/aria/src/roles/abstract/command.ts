import { Role } from "../../types";
import { Widget } from "./widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#command
 */
export const Command: Role = {
  name: "command",
  abstract: true,
  label: { from: "author" },
  inherits: [Widget]
};
