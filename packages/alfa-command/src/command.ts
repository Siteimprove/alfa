import { Marker } from "@siteimprove/alfa-highlight";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Ok, Err } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Argument } from "./argument";
import { Flag } from "./flag";
import { Text } from "./text";

const { values, entries } = Object;

export class Command<
  F extends Command.Flags = {},
  A extends Command.Arguments = {},
  S extends Command.Subcommands = {}
> implements Serializable {
  public static withArguments<
    F extends Command.Flags,
    A extends Command.Arguments
  >(
    name: string,
    version: string,
    description: string,
    flags: F,
    args: A,
    parent: Option<Command> = None,
    run?: (command: Command<F, A, {}>) => Command.Runner<F, A>
  ): Command<F, A, {}> {
    return new Command(
      name,
      version,
      description,
      flags,
      args,
      () => ({}),
      parent,
      run
    );
  }

  public static withSubcommands<
    F extends Command.Flags,
    S extends Command.Subcommands
  >(
    name: string,
    version: string,
    description: string,
    flags: F,
    subcommands: Mapper<Command, S>,
    parent: Option<Command> = None,
    run?: (command: Command<F, {}, S>) => Command.Runner<F, {}>
  ): Command<F, {}, S> {
    return new Command(
      name,
      version,
      description,
      flags,
      {},
      subcommands,
      parent,
      run
    );
  }

  private readonly _name: string;
  private readonly _version: string;
  private readonly _description: string;
  private readonly _flags: F;
  private readonly _arguments: A;
  private readonly _subcommands: S;
  private readonly _parent: Option<Command>;
  private readonly _run: Command.Runner<F, A>;

  private constructor(
    name: string,
    version: string,
    description: string,
    flags: F,
    args: A,
    subcommands: Mapper<Command, S>,
    parent: Option<Command>,
    run?: (command: Command<F, A, S>) => Command.Runner<F, A>
  ) {
    this._name = name;
    this._version = version;
    this._description = description;
    this._flags = flags;
    this._arguments = args;
    this._subcommands = subcommands((this as unknown) as Command);
    this._parent = parent;
    this._run = run?.(this) ?? (async () => Ok.of(this._help()));
  }

  public get name(): string {
    return this._name;
  }

  public get version(): string {
    return this._version;
  }

  public get description(): string {
    return this._description;
  }

  public get flags(): F {
    return this._flags;
  }

  public get arguments(): A {
    return this._arguments;
  }

  public get subcommands(): S {
    return this._subcommands;
  }

  public async run(input: Array<string> | Command.Input<F, A>): Command.Output {
    if (Array.isArray(input)) {
      let argv = input;

      input = {} as Command.Input<F, A>;

      const flags = this._parseFlags(argv);

      if (flags.isErr()) {
        return flags;
      }

      [argv, input.flags] = flags.get();

      for (const name in this._flags) {
        const value = input.flags[name];

        if (Option.isOption(value) && value.isSome()) {
          switch (value.get()) {
            case Flag.Help:
              return Ok.of(this._help());
            case Flag.Version:
              return Ok.of(this._version);
          }
        }
      }

      if (argv[0] === "--") {
        argv = argv.slice(1);
      }

      for (const command of values(this._subcommands)) {
        if (command.name === argv[0]) {
          return command.run(argv.slice(1));
        }
      }

      const args = this._parseArguments(argv);

      if (args.isErr()) {
        return args;
      }

      [argv, input.args] = args.get();

      if (argv.length !== 0) {
        const [argument] = argv;

        return Err.of(
          `Unknown ${argument[0] === "-" ? "flag" : "argument"}: ${argument}`
        );
      }
    }

    return this._run(input);
  }

  public toJSON(): Command.JSON {
    return {
      name: this._name,
      description: this._description,
      flags: values(this._flags).map((flag) => flag.toJSON()),
      arguments: values(this._arguments).map((argument) => argument.toJSON()),
      subcommands: values(this._subcommands).map((command) => command.toJSON()),
    };
  }

  private _parseFlags(
    argv: Array<string>
  ): Result<readonly [Array<string>, Command.Flags.Values<F>], string> {
    const flags = entries(this._flags);

    const sets: Record<string, Flag.Set<unknown>> = {};

    while (argv.length > 0) {
      const [argument] = argv;

      if (argument[0] !== "-") {
        break;
      }

      const match = flags.find(([, flag]) => flag.matches(argument));

      if (match === undefined) {
        return Err.of(`Unknown flag: ${argument}`);
      }

      const [name, flag] = match;

      const parse = name in sets ? sets[name].parse : flag.parse;

      const value = parse(argv);

      if (value.isOk()) {
        [argv, sets[name]] = value.get();
      } else {
        return Err.of(`${argument}: ${value.getErr()}`);
      }
    }

    const values: Record<string, unknown> = {};

    for (const [name, flag] of flags) {
      if (name in sets) {
        values[name] = sets[name].value;
      } else {
        const result = flag.parse([]);

        if (result.isErr()) {
          return Err.of(`--${flag.name}: ${result.getErr()}`);
        }

        const [, { value }] = result.get();

        values[name] = value;
      }
    }

    return Ok.of([argv, values as Command.Flags.Values<F>] as const);
  }

  private _parseArguments(
    argv: Array<string>
  ): Result<readonly [Array<string>, Command.Arguments.Values<A>], string> {
    const values: Record<string, unknown> = {};

    for (const [name, argument] of entries(this._arguments)) {
      const result = argument.parse(argv);

      if (result.isOk()) {
        [argv, values[name]] = result.get();
      } else {
        return Err.of(`${argument.name}: ${result.getErr()}`);
      }
    }

    return Ok.of([argv, values as Command.Arguments.Values<A>] as const);
  }

  private _invocation(): string {
    const invocation = this._name;

    for (const parent of this._parent) {
      return parent._invocation() + " " + invocation;
    }

    return invocation;
  }

  private _help(): string {
    return [
      this._description,
      this._helpVersion(),
      this._helpUsage(),
      ...this._helpArguments(),
      ...this._helpCommands(),
      ...this._helpFlags(),
    ].join("\n\n");
  }

  private _helpUsage(): string {
    return `
${Marker.bold("Usage:")}
  ${Marker.bold("$")} ${this._invocation()} [flags] ${[
      ...values(this._arguments),
    ]
      .map((argument) =>
        argument.options.optional
          ? `[<${argument.name}>]`
          : `<${argument.name}>`
      )
      .join(" ")}
    `.trim();
  }

  private _helpVersion(): string {
    return `
${Marker.bold("Version:")}
  ${this._version}
    `.trim();
  }

  private _helpArguments(): Option<string> {
    const args = values(this._arguments);

    if (args.length === 0) {
      return None;
    }

    return Option.of(
      `
${Marker.bold("Arguments:")}
${args
  .map((argument) => {
    const { options } = argument;

    let help = "  ";

    help += Marker.bold(`${argument.name}`);

    if (!options.optional) {
      help += " " + Marker.dim("(required)");
    }

    for (const value of options.default) {
      help += " " + Marker.dim(`[default: ${value}]`);
    }

    help += "\n";
    help += Text.indent(Text.wrap(argument.description, 76), 4);

    return help;
  })
  .join("\n\n")}
      `.trim()
    );
  }

  private _helpCommands(): Option<string> {
    const commands = values(this._subcommands);

    if (commands.length === 0) {
      return None;
    }

    return Option.of(
      `
${Marker.bold("Commands:")}
${[...values(this._subcommands)]
  .map(
    (command) =>
      `  ${Marker.bold(command.name)}\n${Text.indent(
        Text.wrap(command.description, 76),
        4
      )}`
  )
  .join("\n\n")}
      `.trim()
    );
  }

  private _helpFlags(): Option<string> {
    const flags = values(this._flags);

    if (flags.length === 0) {
      return None;
    }

    return Option.of(
      `
${Marker.bold("Flags:")}
${[...values(this._flags)]
  .map((flag) => {
    const { options } = flag;

    let help = "  ";

    if (options.aliases.length > 0) {
      help +=
        options.aliases
          .map((alias) =>
            Marker.bold(alias.length === 1 ? `-${alias}` : `--${alias}`)
          )
          .join(", ") + ", ";
    }

    help += Marker.bold(`--${options.negatable ? "[no-]" : ""}${flag.name}`);

    for (const type of options.type) {
      help += ` <${Marker.underline(type)}>`;
    }

    if (!options.optional) {
      help += " " + Marker.dim("(required)");
    }

    for (const value of options.default) {
      help += " " + Marker.dim(`[default: ${value}]`);
    }

    help += "\n";
    help += Text.indent(Text.wrap(flag.description, 76), 4);

    return help;
  })
  .join("\n\n")}
      `.trim()
    );
  }
}

export namespace Command {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    description: string;
    flags: Array<Flag.JSON>;
    arguments: Array<Argument.JSON>;
    subcommands: Array<Command.JSON>;
  }

  export interface Flags {
    [name: string]: Flag<any>;
  }

  export namespace Flags {
    export type Values<F extends Flags> = {
      [N in keyof F]: F[N] extends Flag<infer T> ? T : never;
    };
  }

  export interface Arguments {
    [name: string]: Argument<any>;
  }

  export namespace Arguments {
    export type Values<A extends Arguments> = {
      [N in keyof A]: A[N] extends Argument<infer T> ? T : never;
    };
  }

  export interface Subcommands {
    [name: string]: Command<any, any, any>;
  }

  export interface Input<F extends Flags, A extends Arguments> {
    flags: Flags.Values<F>;
    args: Arguments.Values<A>;
  }

  export type Output = Promise<Result<string>>;

  export type Runner<F extends Flags, A extends Arguments> = (
    input: Input<F, A>
  ) => Output;
}
