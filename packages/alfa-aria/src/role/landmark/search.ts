import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#search
 */
Role.register(
  Role.of("search", Role.Category.Landmark, {
    inherits: ["landmark"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
