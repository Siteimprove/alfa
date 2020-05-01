import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#tooltip
 */
Role.register(
  Role.of("tooltip", Role.Category.Structure, {
    inherits: ["section"],
    name: {
      from: ["contents", "author"],
      required: true,
    },
  })
);
