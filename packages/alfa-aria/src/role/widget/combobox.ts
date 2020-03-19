import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#combobox
 */
Role.register(
  Role.of("combobox", Role.Category.Widget, {
    inherits: ["select"],
    requires: ["aria-expanded"],
    supports: [
      "aria-autocomplete",
      "aria-readonly",
      "aria-required",

      // This property is only required when the combobox is expanded so we list
      // it as supported instead.
      "aria-controls"
    ],
    owns: ["textbox"],
    name: {
      from: ["author"],
      required: true
    },
    implicits: [
      ["aria-expanded", "false"],
      ["aria-haspopup", "listbox"]
    ]
  })
);
