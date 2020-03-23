import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#navigation
 */
Role.register(
  Role.of("navigation", Role.Category.Landmark, {
    inherits: ["landmark"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
