import { Stream } from "./stream";

export interface Token<T extends number = number> {
  readonly type: T;
}

export type TokenIdentifier<T extends Token> = T["type"];

export const Skip = Symbol("Skip");
export type Skip = typeof Skip;

export const Exit = Symbol("Exit");
export type Exit = typeof Exit;

export type Pattern<T extends Token, S = null> = (
  stream: Stream<number>,
  emit: <U extends T>(token: U) => void,
  state: S,
  commands: Readonly<{ exit: Exit }>
) => Pattern<T, S> | Exit | void;

export type Expression<T> = () => T | null;

export interface Production<
  T extends Token,
  R,
  U extends T = T,
  P extends R = R,
  S = null
> {
  readonly token: TokenIdentifier<U>;

  readonly associate?: "left" | "right";

  prefix?(
    token: U,
    stream: Stream<T>,
    expression: Expression<R>,
    state: S,
    commands: Readonly<{ skip: Skip }>
  ): P | Skip | null;

  infix?(
    token: U,
    stream: Stream<T>,
    expression: Expression<R>,
    left: R,
    state: S,
    commands: Readonly<{ skip: Skip }>
  ): P | Skip | null;
}
