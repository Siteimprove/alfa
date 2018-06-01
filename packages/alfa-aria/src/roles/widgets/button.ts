import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Command } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#button
 */
export const Button: Role = {
  name: "button",
  inherits: [Command],
  supported: [Attributes.Expanded, Attributes.Pressed],
  label: { from: ["contents", "author"], required: true }
};
