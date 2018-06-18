import { Role } from "../../types";
import { Range } from "../abstract/range";

/**
 * @see https://www.w3.org/TR/wai-aria/#progressbar
 */
export const ProgressBar: Role = {
  name: "progressbar",
  inherits: () => [Range],
  label: { from: ["author"], required: true }
};
