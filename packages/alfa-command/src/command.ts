import { Marker } from "@siteimprove/alfa-highlight";
import { Serializable } from "@siteimprove/alfa-json";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Option, None } from "@siteimprove/alfa-option";
import { Result, Ok, Err } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Argument } from "./argument";
import { Flag } from "./flag";
import { Text } from "./text";

const { values } = Object;

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
    this._run = run?.(this) ?? (async () => Ok.of(this._help() + "\n"));
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
      const parsed = {
        flags: {} as Record<string, any>,
        args: {} as Record<string, any>,
      };

      outer: while (input.length > 0) {
        const [arg] = input;

        if (!arg.startsWith("-")) {
          break;
        }

        for (const name in this._flags) {
          const flag = this._flags[name];

          if (!flag.matches(arg)) {
            continue;
          }

          let value: Result<readonly [Array<string>, Flag.Set<any>], string>;

          if (name in parsed.flags) {
            value = parsed.flags[name].parse(input.slice(1));
          } else {
            value = flag.parse(input.slice(1));
          }

          if (value.isErr()) {
            return Err.of(`error: ${arg}: ${value.getErr()}\n`);
          }

          [input, parsed.flags[name]] = value.get();

          continue outer;
        }

        break;
      }

      for (const name in this._flags) {
        const flag = this._flags[name];

        if (flag.name === "help" && name in parsed.flags) {
          const { value } = parsed.flags[name];

          if (Option.isOption(value) && value.includes(Flag.Help)) {
            return Ok.of(this._help() + "\n");
          }
        }

        if (flag.name === "version" && name in parsed.flags) {
          const { value } = parsed.flags[name];

          if (Option.isOption(value) && value.includes(Flag.Version)) {
            return Ok.of(this.version + "\n");
          }
        }
      }

      for (const name in this._flags) {
        const flag = this._flags[name];

        if (name in parsed.flags === false) {
          if (flag.options.default.isSome()) {
            parsed.flags[name] = flag.options.default.get();
          } else {
            return Err.of(`error: missing flag: --${flag.name}\n`);
          }
        } else {
          parsed.flags[name] = parsed.flags[name].value;
        }
      }

      if (input[0] === "--") {
        input = input.slice(1);
      }

      for (const name in this._subcommands) {
        const command = this._subcommands[name];

        if (command.name === input[0]) {
          return command.run(input.slice(1));
        }
      }

      for (const name in this._arguments) {
        const argument = this._arguments[name];

        const value = argument.parse(input);

        if (value.isErr()) {
          if (argument.options.default.isSome()) {
            parsed.args[name] = argument.options.default.get();
            continue;
          }

          return Err.of(`error: ${argument.name}: ${value.getErr()}\n`);
        }

        [input, parsed.args[name]] = value.get();
      }

      if (input.length !== 0) {
        const [arg] = input;

        return Err.of(
          `unknown ${arg.startsWith("-") ? "flag" : "argument"}: ${arg}\n`
        );
      }

      input = parsed as Command.Input<F, A>;
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
    let help = "  ";

    help += Marker.bold(`${argument.name}`);

    if (!argument.options.optional) {
      help += " " + Marker.dim("(required)");
    }

    for (let value of argument.options.default) {
      if (value === None) {
        continue;
      }

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
    let help = "  ";

    if (flag.options.aliases.length > 0) {
      help +=
        flag.options.aliases
          .map((alias) =>
            Marker.bold(alias.length === 1 ? `-${alias}` : `--${alias}`)
          )
          .join(", ") + ", ";
    }

    help += Marker.bold(`--${flag.name}`);

    for (const type of flag.options.type) {
      help += ` <${Marker.underline(type)}>`;
    }

    if (!flag.options.optional) {
      help += " " + Marker.dim("(required)");
    }

    for (let value of flag.options.default) {
      if (value === None) {
        continue;
      }

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
