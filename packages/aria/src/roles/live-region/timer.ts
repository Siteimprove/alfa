import { Role } from "../../types";
import { Status } from "../live-region";

/**
 * @see https://www.w3.org/TR/wai-aria/#timer
 */
export const Timer: Role = {
  name: "timer",
  inherits: [Status],
  label: { from: ["author"], required: true }
};
