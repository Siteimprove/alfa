import { Role } from "../../types";
import { List } from "../structure";

/**
 * @see https://www.w3.org/TR/wai-aria/#directory
 */
export const Directory: Role = {
  name: "directory",
  inherits: [List],
  label: { from: ["author"] }
};
