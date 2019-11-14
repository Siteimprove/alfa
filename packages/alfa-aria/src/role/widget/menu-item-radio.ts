import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitemradio
 */
Role.register(
  Role.of("menuitemradio", Role.Category.Widget, {
    inherits: ["radio", "menuitemcheckbox"],
    context: ["group", "menu", "menubar"],
    name: { from: ["contents", "author"], required: true },
    implicits: [["aria-checked", "false"]]
  })
);
