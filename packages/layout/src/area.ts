import { Layout } from "./types";
import { width } from "./width";
import { height } from "./height";

export function area(layout: Layout): number {
  return width(layout) * height(layout);
}
