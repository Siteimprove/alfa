import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/graphics-aria/#graphics-document
 */
Role.register(
  Role.of("graphics-document", Role.Category.Graphic, {
    inherits: ["document"],
    name: {
      from: ["author"],
      required: true
    }
  })
);
