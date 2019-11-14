import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#sectionhead
 */
Role.register(
  Role.of("sectionhead", Role.Category.Abstract, {
    inherits: ["structure"],
    supports: ["aria-expanded"],
    name: {
      from: ["contents", "author"],
      required: false
    }
  })
);
