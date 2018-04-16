import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Command } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#link
 */
export const Link: Role = {
  name: "link",
  inherits: [Command],
  supported: [Attributes.Expanded],
  label: { from: ["contents", "author"], required: true }
};
