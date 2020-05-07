import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#menuitem
 */
Role.register(
  Role.of("menuitem", Role.Category.Widget, {
    inherits: ["command"],
    supports: ["aria-posinset", "aria-setsize"],
    context: ["group", "menu", "menubar"],
    name: {
      from: ["contents", "author"],
      required: true,
    },
  })
);
