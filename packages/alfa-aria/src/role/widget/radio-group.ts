import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#radiogroup
 */
Role.register(
  Role.of("radiogroup", Role.Category.Widget, {
    inherits: ["select"],
    supports: ["aria-readonly", "aria-required"],
    owns: ["radio"],
    name: {
      from: ["author"],
      required: true,
    },
  })
);
