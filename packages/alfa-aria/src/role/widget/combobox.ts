import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#combobox
 */
Role.register(
  Role.of("combobox", Role.Category.Widget, {
    inherits: ["select"],
    requires: ["aria-controls", "aria-expanded"],
    supports: ["aria-autocomplete", "aria-readonly", "aria-required"],
    owns: ["textbox", "listbox", "tree", "grid", "dialog"],
    name: {
      from: ["author"],
      required: true
    },
    implicits: [["aria-expanded", "false"], ["aria-haspopup", "listbox"]]
  })
);
