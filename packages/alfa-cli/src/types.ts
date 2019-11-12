import { Outcome } from "@siteimprove/alfa-act";
import yargs from "yargs";

export type Arguments<T> = yargs.Arguments<T>;

export namespace Arguments {
  export type Builder<T> = yargs.Argv<T>;
}

export interface Command<T> {
  readonly command: string;
  readonly describe: string;
  readonly builder?: Command.Builder<T>;
  readonly handler?: Command.Handler<T>;
}

export namespace Command {
  export type Builder<T> = <U>(
    builder: Arguments.Builder<U>
  ) => Arguments.Builder<T>;

  export type Handler<T> = (args: Arguments<T>) => void;

  export function of<T>(command: Command<T>): Command<T> {
    return command;
  }
}

export type Formatter<I, T, Q> = (
  outcomes: Iterable<Outcome<I, T, Q>>
) => string;
