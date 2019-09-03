import { Role } from "./types";

export function hasNameFrom(
  role: Role,
  nameFrom: "contents" | "author"
): boolean {
  const { label } = role;

  if (label === undefined) {
    return false;
  }

  for (const found of label.from) {
    if (found === nameFrom) {
      return true;
    }
  }

  return false;
}
