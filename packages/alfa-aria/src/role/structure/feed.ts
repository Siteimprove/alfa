import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#feed
 */
Role.register(
  Role.of("feed", Role.Category.Structure, {
    inherits: ["list"],
    owns: ["article"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
