import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/graphics-aria/#graphics-symbol
 */
Role.register(
  Role.of("graphics-symbol", Role.Category.Graphic, {
    inherits: ["img"],
    name: {
      from: ["author"],
      required: true
    }
  })
);
