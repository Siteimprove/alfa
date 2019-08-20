export type Vector<N extends number = number> = [number, ...Array<number>] & {
  readonly length: N;
};
