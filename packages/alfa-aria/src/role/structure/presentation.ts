import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#presentation
 */
Role.register(
  Role.of("presentation", Role.Category.Structure, {
    inherits: ["structure"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
