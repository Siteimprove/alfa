export type JSON = string | number | boolean | null | JSON.Array | JSON.Object;

export namespace JSON {
  export type Array = JSON[];

  export interface Object {
    [key: string]: JSON | undefined;
  }
}
