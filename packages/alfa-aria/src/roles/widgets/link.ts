import * as Attributes from "../../attributes";
import { Role } from "../../types";
import { Command } from "../abstract/command";

/**
 * @see https://www.w3.org/TR/wai-aria/#link
 */
export const Link: Role = {
  name: "link",
  inherits: () => [Command],
  supported: () => [Attributes.Expanded],
  label: { from: ["contents", "author"], required: true }
};
