import { Role } from "./types";

export function hasNameFrom(
  role: Role,
  nameFrom: "contents" | "author"
): boolean {
  const { label } = role;

  if (label === undefined) {
    return false;
  }

  for (let i = 0, n = label.from.length; i < n; i++) {
    if (label.from[i] === nameFrom) {
      return true;
    }
  }

  return false;
}
