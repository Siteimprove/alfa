import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#dialog
 */
Role.register(
  Role.of("dialog", Role.Category.Window, {
    inherits: ["window"],
    name: { from: ["author"], required: true }
  })
);
