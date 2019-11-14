import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#searchbox
 */
Role.register(
  Role.of("searchbox", Role.Category.Widget, {
    inherits: ["textbox"],
    name: {
      from: ["author"],
      required: true
    }
  })
);
