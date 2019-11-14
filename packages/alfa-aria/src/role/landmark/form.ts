import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#form
 */
Role.register(
  Role.of("form", Role.Category.Landmark, {
    inherits: ["landmark"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
