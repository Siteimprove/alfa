import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#region
 */
Role.register(
  Role.of("region", Role.Category.Landmark, {
    inherits: ["landmark"],
    name: {
      from: ["author"],
      required: true,
    },
  })
);
