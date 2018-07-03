import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Command } from "../abstract/command";

/**
 * @see https://www.w3.org/TR/wai-aria/#button
 */
export const Button: Role = {
  name: "button",
  inherits: () => [Command],
  supported: () => [Attributes.Expanded, Attributes.Pressed],
  label: { from: ["contents", "author"], required: true }
};
