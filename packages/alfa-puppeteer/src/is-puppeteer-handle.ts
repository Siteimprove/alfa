import { hasKey, isObject } from "@siteimprove/alfa-util";
import { JSHandle } from "puppeteer";

export function isPuppeteerHandle(input: unknown): input is JSHandle {
  return isObject(input) && input !== null && hasKey(input, "dispose");
}
