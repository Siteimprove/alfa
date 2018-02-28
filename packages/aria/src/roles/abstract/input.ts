import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Widget } from "./widget";

/**
 * @see https://www.w3.org/TR/wai-aria/#input
 */
export const Input: Role = {
  name: "input",
  abstract: true,
  label: { from: ["author"] },
  inherits: [Widget]
};
