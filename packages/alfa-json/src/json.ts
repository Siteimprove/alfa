import * as builtin from "./builtin";

/**
 * @public
 */
export type JSON = string | number | boolean | null | JSON.Array | JSON.Object;

/**
 * @public
 */
export namespace JSON {
  export type Array = JSON[];

  export interface Object {
    [key: string]: JSON | undefined;
  }

  export function parse(value: string): JSON {
    return builtin.JSON.parse(value);
  }

  export function stringify(value: JSON): string {
    return builtin.JSON.stringify(value);
  }
}
