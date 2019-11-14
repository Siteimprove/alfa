import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#alertdialog
 */
Role.register(
  Role.of("alertdialog", Role.Category.Window, {
    inherits: ["alert", "dialog"],
    name: { from: ["author"], required: true }
  })
);
