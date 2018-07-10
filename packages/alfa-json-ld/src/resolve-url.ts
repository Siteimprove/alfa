import { URL } from "@siteimprove/alfa-util";

export function resolveUrl(target: string, base: string): string {
  return new URL(target, base).href;
}
