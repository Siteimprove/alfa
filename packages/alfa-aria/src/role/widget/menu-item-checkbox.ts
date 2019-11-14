import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitemcheckbox
 */
Role.register(
  Role.of("menuitemcheckbox", Role.Category.Widget, {
    inherits: ["checkbox", "menuitem"],
    context: ["menu", "menubar"],
    name: {
      from: ["contents", "author"],
      required: true
    },
    implicits: [["aria-checked", "false"]]
  })
);
