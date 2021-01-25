export interface Clone<T> {
  clone(): T;
}

export namespace Clone {
  export function clone<T extends Clone<T>>(value: Clone<T>): T {
    return value.clone();
  }
}
