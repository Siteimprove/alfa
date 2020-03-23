import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#group
 */
Role.register(
  Role.of("group", Role.Category.Structure, {
    inherits: ["section"],
    supports: ["aria-activedescendant"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
