import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#term
 */
Role.register(
  Role.of("term", Role.Category.Structure, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
