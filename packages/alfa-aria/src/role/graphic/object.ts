import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/graphics-aria/#graphics-object
 */
Role.register(
  Role.of("graphics-object", Role.Category.Graphic, {
    inherits: ["group"],
    name: {
      from: ["author", "contents"],
      required: false,
    },
  })
);
