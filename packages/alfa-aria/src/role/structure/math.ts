import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#math
 */
Role.register(
  Role.of("math", Role.Category.Structure, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
