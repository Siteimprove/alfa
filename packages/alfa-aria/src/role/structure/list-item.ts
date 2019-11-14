import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#listitem
 */
Role.register(
  Role.of("listitem", Role.Category.Structure, {
    inherits: ["section"],
    supports: ["aria-level", "aria-posinset", "aria-setsize"],
    context: ["group", "list"],
    name: {
      from: ["author"],
      required: false
    }
  })
);
