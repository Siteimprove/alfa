import { Role } from "../../types";
import { Range } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#progressbar
 */
export const ProgressBar: Role = {
  name: "progressbar",
  label: { from: ["author"], required: true },
  inherits: [Range]
};
