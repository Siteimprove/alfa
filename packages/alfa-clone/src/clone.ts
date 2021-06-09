/**
 * @public
 */
export interface Clone<T> {
  clone(): T;
}

/**
 * @public
 */
export namespace Clone {
  export function clone<T extends Clone<T>>(value: Clone<T>): T {
    return value.clone();
  }
}
