import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#main
 */
Role.register(
  Role.of("main", Role.Category.Landmark, {
    inherits: ["landmark"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
