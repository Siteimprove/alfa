import { Aspect, AspectsFor, Result, Target } from "@siteimprove/alfa-act";
import yargs from "yargs";

export type Arguments<T> = yargs.Arguments<T>;

export namespace Arguments {
  export type Builder<T> = yargs.Argv<T>;
}

export interface Command<U> {
  readonly command: string;
  readonly describe: string;
  readonly builder?: Command.Builder<U>;
  readonly handler?: Command.Handler<U>;
}

export namespace Command {
  export type Builder<U> = <T>(
    builder: Arguments.Builder<T>
  ) => Arguments.Builder<U>;

  export type Handler<U> = (args: Arguments<U>) => void;
}

export type Formatter<A extends Aspect, T extends Target> = (
  results: Iterable<Result<A, T>>,
  aspects: AspectsFor<A>
) => string;
