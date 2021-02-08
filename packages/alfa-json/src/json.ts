import * as global from "./global";

export type JSON = string | number | boolean | null | JSON.Array | JSON.Object;

export namespace JSON {
  export type Array = JSON[];

  export interface Object {
    [key: string]: JSON | undefined;
  }

  export function parse(value: string): JSON {
    return global.parse(value);
  }

  export function stringify(value: JSON): string {
    return global.stringify(value);
  }
}
