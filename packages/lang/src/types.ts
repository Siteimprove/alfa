import { Stream } from "./stream";

export interface Token {
  readonly type: string;
}

export interface Location {
  readonly line: number;
  readonly column: number;
}

export type WithLocation<T extends Token> = T &
  Readonly<{ location: Readonly<{ start: Location; end: Location }> }>;

export type Pattern<T extends Token, S> = (
  stream: Stream<string>,
  emit: <U extends T>(token: WithLocation<U>) => void,
  state: S,
  end: () => void
) => Pattern<T, S> | void;

export type Expression<T> = () => T | null;

export interface Production<
  T extends Token,
  R,
  U extends T = T,
  P extends R = R
> {
  readonly token: U["type"];
  readonly associate?: "left" | "right";
  prefix?(token: U, stream: Stream<T>, expression: Expression<R>): P | null;
  infix?(
    token: U,
    stream: Stream<T>,
    expression: Expression<R>,
    left: R
  ): P | null;
}
