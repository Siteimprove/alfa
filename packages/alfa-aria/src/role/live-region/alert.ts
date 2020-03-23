import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#alert
 */
Role.register(
  Role.of("alert", Role.Category.LiveRegion, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: false,
    },
    implicits: [
      ["aria-live", "assertive"],
      ["aria-atomic", "true"],
    ],
  })
);
