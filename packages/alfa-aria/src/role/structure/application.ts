import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#application
 */
Role.register(
  Role.of("application", Role.Category.Structure, {
    inherits: ["structure"],
    supports: ["aria-activedescendant"],
    name: {
      from: ["author"],
      required: true
    }
  })
);
