import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#composite
 */
Role.register(
  Role.of("composite", Role.Category.Abstract, {
    inherits: ["widget"],
    supports: ["aria-activedescendant"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
