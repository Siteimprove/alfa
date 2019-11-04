import { clamp } from "./clamp";

export function round(value: number, decimals = 0): number {
  decimals = clamp(decimals, 0, 20);

  return decimals === 0
    ? Math.round(value)
    : Math.round(value * 10 ** decimals) / 10 ** decimals;
}
