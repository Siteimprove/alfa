import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#banner
 */
Role.register(
  Role.of("banner", Role.Category.Landmark, {
    inherits: ["landmark"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
