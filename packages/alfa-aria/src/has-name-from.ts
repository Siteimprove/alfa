import { Role } from "./types";

export function hasNameFrom(
  role: Role,
  nameFrom: "contents" | "author"
): boolean {
  return role.label !== undefined && role.label.from.includes(nameFrom);
}
