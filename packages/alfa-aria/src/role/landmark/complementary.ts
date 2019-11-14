import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#complementary
 */
Role.register(
  Role.of("complementary", Role.Category.Landmark, {
    inherits: ["landmark"],
    name: { from: ["author"], required: false }
  })
);
