import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#menu
 */
Role.register(
  Role.of("menu", Role.Category.Widget, {
    inherits: ["select"],
    owns: [
      "menuitem",
      "menuitemcheckbox",
      "menuitemradio",
      ["group", "menuitemradio"]
    ],
    name: {
      from: ["author"],
      required: false
    },
    implicits: [["aria-orientation", "vertical"]]
  })
);
