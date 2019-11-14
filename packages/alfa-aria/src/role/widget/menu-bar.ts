import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#menubar
 */
Role.register(
  Role.of("menubar", Role.Category.Widget, {
    inherits: ["menu"],
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
    implicits: [["aria-orientation", "horizontal"]]
  })
);
