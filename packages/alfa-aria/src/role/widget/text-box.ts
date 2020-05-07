import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#textbox
 */
Role.register(
  Role.of("textbox", Role.Category.Widget, {
    inherits: ["input"],
    supports: [
      "aria-activedescendant",
      "aria-autocomplete",
      "aria-multiline",
      "aria-placeholder",
      "aria-readonly",
      "aria-required",
    ],
    name: {
      from: ["author"],
      required: true,
    },
  })
);
