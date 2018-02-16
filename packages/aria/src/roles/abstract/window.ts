/**
 * @see https://www.w3.org/TR/wai-aria/#window
 */
export const Window: Role = {
  name: "window",
  abstract: true,
  inherits: [Roletype],
  supported: [Attributes.Expanded, Attributes.Modal]
};
