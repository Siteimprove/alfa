import { Aspect, AspectsFor, Result, Target } from "@siteimprove/alfa-act";
import yargs from "yargs";

export type Arguments<T> = yargs.Arguments<T>;

export type ArgumentsBuilder<T> = yargs.Argv<T>;

export interface Command<U> {
  readonly command: string;
  readonly describe: string;
  readonly builder?: <T>(builder: ArgumentsBuilder<T>) => ArgumentsBuilder<U>;
  readonly handler?: (args: Arguments<U>) => void;
}

export type Formatter<A extends Aspect, T extends Target> = (
  results: Iterable<Result<A, T>>,
  aspects: AspectsFor<A>
) => string;
