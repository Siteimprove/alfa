import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#spinbutton
 */
Role.register(
  Role.of("spinbutton", Role.Category.Widget, {
    inherits: ["composite", "input", "range"],
    requires: ["aria-valuemax", "aria-valuemin", "aria-valuenow"],
    supports: ["aria-readonly", "aria-required"],
    name: {
      from: ["author"],
      required: true,
    },
    implicits: [
      ["aria-valuemin", ""],
      ["aria-valuemax", ""],
      ["aria-valuenow", "0"],
    ],
  })
);
