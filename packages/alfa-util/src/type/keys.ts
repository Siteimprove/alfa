export type Keys<T, E extends string | number | symbol = string> = T extends {}
  ? Extract<keyof T, E>
  : never;
