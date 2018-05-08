import * as getDebugger from "debug";

const log = getDebugger("alfa");

export function debug(format: string, ...args: Array<any>): void {
  log(format, args);
}
