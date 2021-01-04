export type Callback<T, R = void, A extends Array<unknown> = []> = (
  value: T,
  ...args: A
) => R;
