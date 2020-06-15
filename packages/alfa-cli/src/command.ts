/// <reference types="node" />

import * as path from "path";
import * as process from "process";

import { Marker } from "@siteimprove/alfa-highlight";
import { Serializable } from "@siteimprove/alfa-json";
import { Result, Ok, Err } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Argument } from "./argument";
import { Flag } from "./flag";
import { Text } from "./text";

const { values } = Object;

/**
 * @internal
 */
export class Command<
  F extends Command.Flags = Command.Flags,
  A extends Command.Arguments = Command.Arguments
> implements Serializable {
  public static of<F extends Command.Flags, A extends Command.Arguments>(
    name: string,
    description: string,
    flags: F,
    args: A,
    run: Command.Runner<F, A>
  ): Command<F, A> {
    return new Command(name, description, flags, args, run);
  }

  private readonly _name: string;
  private readonly _description: string;
  private readonly _binary: string;
  private readonly _flags: F;
  private readonly _arguments: A;
  private readonly _run: Command.Runner<F, A>;

  private constructor(
    name: string,
    description: string,
    flags: F,
    args: A,
    run: Command.Runner<F, A>
  ) {
    this._name = name;
    this._description = description;
    this._binary = path.basename(process.argv[1]);
    this._flags = flags;
    this._arguments = args;
    this._run = run;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get binary(): string {
    return this._description;
  }

  public get flags(): F {
    return this._flags;
  }

  public get arguments(): A {
    return this._arguments;
  }

  public get run(): Command.Runner<F, A> {
    return this._run;
  }

  public parse(argv: Array<string>): Result<Command.Input<F, A>, string> {
    const flags: Record<string, unknown> = {};

    for (const name in this._flags) {
      const flag = this._flags[name];

      while (true) {
        const result = flag.parse(argv);

        if (result.isErr()) {
          switch (result.getErr()) {
            case Flag.Error.NotSpecified:
              return Err.of(`error: --${flag.name} must be specified`);

            case Flag.Error.MissingValue:
              return Err.of(`error: --${flag.name} is missing a value`);

            case Flag.Error.InvalidValue:
              return Err.of(`error: --${flag.name} has an invalid value`);
          }
        }

        const [remainder, value] = result.get();

        if (remainder.length === argv.length) {
          if (name in flags === false) {
            flags[name] = value;
          }

          break;
        }

        flags[name] = value;
        argv = remainder;
      }
    }

    if (argv[0] === "--") {
      argv = argv.slice(1);
    }

    if (argv[0] !== undefined && argv[0].startsWith("-")) {
      return Err.of(`unknown flag: ${argv[0]}`);
    }

    const args: Record<string, unknown> = {};

    for (const name in this._arguments) {
      const argument = this._arguments[name];

      const result = argument.parse(argv);

      if (result.isErr()) {
        switch (result.getErr()) {
          case Argument.Error.NotSpecified:
            return Err.of(`error: ${argument.name} must be specified`);

          case Argument.Error.InvalidValue:
            return Err.of(`error: ${argument.name} has an invalid value`);
        }
      }

      const [remainder, value] = result.get();

      if (remainder.length === argv.length) {
        if (name in args === false) {
          args[name] = value;
        }

        break;
      }

      args[name] = value;
      argv = remainder;
    }

    if (argv.length !== 0) {
      return Err.of(`unknown arguments: ${argv.join(" ")}`);
    }

    return Ok.of({ flags, args } as Command.Input<F, A>);
  }

  public help(): string {
    return `
${this._description}

${Marker.bold("Usage:")}
  ${Marker.bold("$")} ${this._binary} ${this._name} [flags] ${[
      ...values(this._arguments),
    ]
      .map((argument) =>
        argument.options.get("optional").includes(true)
          ? `[<${argument.name}>]`
          : `<${argument.name}>`
      )
      .join(" ")}

${Marker.bold("Arguments:")}
${[...values(this._arguments)]
  .map((argument) => {
    let help = "  ";

    help += Marker.bold(`${argument.name}`);

    if (argument.options.get("optional").includes(false)) {
      help += " " + Marker.dim("(required)");
    }

    for (let value of argument.options.get("default").get()) {
      value = `${value}`;

      if (value !== "") {
        help += " " + Marker.dim(`[default: ${value}]`);
      }
    }

    help += "\n";
    help += Text.indent(Text.wrap(argument.description, 76), 4);

    return help;
  })
  .join("\n\n")}

${Marker.bold("Flags:")}
${[...values(this._flags)]
  .map((flag) => {
    let help = "  ";

    for (const aliases of flag.options.get("aliases")) {
      if (aliases.length > 0) {
        help +=
          aliases
            .map((alias) =>
              Marker.bold(alias.length === 1 ? `-${alias}` : `--${alias}`)
            )
            .join(", ") + ", ";
      }
    }

    help += Marker.bold(`--${flag.name}`);

    for (const type of flag.options.get("type").get()) {
      help += ` <${Marker.underline(type)}>`;
    }

    if (flag.options.get("optional").includes(false)) {
      help += " " + Marker.dim("(required)");
    }

    for (let value of flag.options.get("default").get()) {
      value = `${value}`;

      if (value !== "") {
        help += " " + Marker.dim(`[default: ${value}]`);
      }
    }

    help += "\n";
    help += Text.indent(Text.wrap(flag.description, 76), 4);

    return help;
  })
  .join("\n\n")}
    `.trim();
  }

  public toJSON(): Command.JSON {
    return {
      name: this._name,
      description: this._description,
      flags: values(this._flags).map((flag) => flag.toJSON()),
      arguments: values(this._arguments).map((argument) => argument.toJSON()),
    };
  }
}

/**
 * @internal
 */
export namespace Command {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    description: string;
    flags: Array<Flag.JSON>;
    arguments: Array<Argument.JSON>;
  }

  export interface Flags {
    readonly [name: string]: Flag<any>;
  }

  export namespace Flags {
    export type Values<F extends Flags> = {
      readonly [N in keyof F]: F[N] extends Flag<infer T> ? T : never;
    };
  }

  export interface Arguments {
    readonly [name: string]: Argument<any>;
  }

  export namespace Arguments {
    export type Values<P extends Arguments> = {
      readonly [N in keyof P]: P[N] extends Argument<infer T> ? T : never;
    };
  }

  export interface Input<F extends Flags, P extends Arguments> {
    flags: Flags.Values<F>;
    args: Arguments.Values<P>;
  }

  export type Output = Promise<Result<string>>;

  export type Runner<F extends Flags, P extends Arguments> = (
    input: Input<F, P>
  ) => Output;
}
