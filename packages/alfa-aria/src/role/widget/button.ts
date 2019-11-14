import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#button
 */
Role.register(
  Role.of("button", Role.Category.Widget, {
    inherits: ["command"],
    supports: ["aria-expanded", "aria-pressed"],
    name: {
      from: ["contents", "author"],
      required: true
    }
  })
);
