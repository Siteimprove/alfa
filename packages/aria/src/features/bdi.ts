import { Feature, AnyRole } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#bdi
 */
export const Bdi: Feature = {
  element: "bdi",
  allowedRoles: AnyRole
};
