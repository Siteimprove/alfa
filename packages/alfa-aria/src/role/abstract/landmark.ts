import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#landmark
 */
Role.register(
  Role.of("landmark", Role.Category.Abstract, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
