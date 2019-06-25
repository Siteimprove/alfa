import { CheerioWrapper } from "./types";

export function isCheerioWrapper<T>(input: unknown): input is CheerioWrapper {
  return input instanceof CheerioWrapper;
}
