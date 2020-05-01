import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#tabpanel
 */
Role.register(
  Role.of("tabpanel", Role.Category.Widget, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: true,
    },
  })
);
