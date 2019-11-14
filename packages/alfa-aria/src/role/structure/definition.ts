import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#definition
 */
Role.register(
  Role.of("definition", Role.Category.Structure, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
