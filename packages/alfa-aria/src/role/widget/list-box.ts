import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#listbox
 */
Role.register(
  Role.of("listbox", Role.Category.Widget, {
    inherits: ["select"],
    supports: ["aria-multiselectable", "aria-readonly", "aria-required"],
    owns: ["option"],
    name: {
      from: ["author"],
      required: true,
    },
    implicits: [["aria-orientation", "vertical"]],
  })
);
