import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#article
 */
Role.register(
  Role.of("article", Role.Category.Structure, {
    inherits: ["document"],
    supports: ["aria-posinset", "aria-setsize"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
