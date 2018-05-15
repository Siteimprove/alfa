import { includes } from "@siteimprove/alfa-util";
import { Role } from "./types";

export function hasNameFrom(
  role: Role,
  nameFrom: "contents" | "author"
): boolean {
  return role.label !== undefined && includes(role.label.from, nameFrom);
}
