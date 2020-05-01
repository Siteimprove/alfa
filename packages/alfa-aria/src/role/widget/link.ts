import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#link
 */
Role.register(
  Role.of("link", Role.Category.Widget, {
    inherits: ["command"],
    supports: ["aria-expanded"],
    name: {
      from: ["contents", "author"],
      required: true,
    },
  })
);
