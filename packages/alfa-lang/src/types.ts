import { Stream } from "./stream";

export type SimpleToken = string;

export type ObjectToken = Readonly<{ type: string }>;

export type Token = SimpleToken | ObjectToken;

export type TokenIdentifier<T extends Token> = T extends ObjectToken
  ? T["type"]
  : T;

export enum Command {
  End,
  Continue
}

export type Pattern<T extends Token, S = null> = (
  stream: Stream<number>,
  emit: <U extends T>(token: U) => void,
  state: S
) => Pattern<T, S> | Command.End | void;

export type Expression<T> = () => T | null;

export interface Production<
  T extends Token,
  R,
  U extends T = T,
  P extends R = R
> {
  readonly token: TokenIdentifier<U>;

  readonly associate?: "left" | "right";

  prefix?(
    token: U,
    stream: Stream<T>,
    expression: Expression<R>
  ): P | Command.Continue | null;

  infix?(
    token: U,
    stream: Stream<T>,
    expression: Expression<R>,
    left: R
  ): P | Command.Continue | null;
}
