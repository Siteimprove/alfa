import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#figure
 */
Role.register(
  Role.of("figure", Role.Category.Structure, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
