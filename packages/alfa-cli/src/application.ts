/// <reference types="node" />

import * as path from "path";

import { Marker } from "@siteimprove/alfa-highlight";
import { Serializable } from "@siteimprove/alfa-json";
import { Option } from "@siteimprove/alfa-option";
import { Result, Ok, Err } from "@siteimprove/alfa-result";

import * as json from "@siteimprove/alfa-json";

import { Command } from "./command";
import { Text } from "./text";

const { values } = Object;

/**
 * @internal
 */
export class Application<C extends Application.Commands = Application.Commands>
  implements Serializable {
  public static of<C extends Application.Commands>(
    name: string,
    version: string,
    description: string,
    commands: C
  ): Application<C> {
    return new Application(name, version, description, commands);
  }

  private readonly _name: string;
  private readonly _version: string;
  private readonly _description: string;
  private readonly _binary: string;
  private readonly _commands: C;

  private constructor(
    name: string,
    version: string,
    description: string,
    commands: C
  ) {
    this._name = name;
    this._version = `${version} ${process.platform}-${process.arch} node-${process.version}`;
    this._description = description;
    this._binary = path.basename(process.argv[1]);
    this._commands = commands;
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

  public get binary(): string {
    return this._binary;
  }

  public get commands(): C {
    return this._commands;
  }

  public async run(argv: Array<string>): Promise<Result<string>> {
    const [name] = argv;

    if (name === undefined || name === "--help") {
      return Ok.of(this.help() + "\n");
    }

    if (name === "--version") {
      return Ok.of(`${this._name}/${this._version}\n`);
    }

    const command = values(this._commands).find(
      (command) => command.name === name
    );

    if (command === undefined) {
      if (name.startsWith("-")) {
        return Err.of(`unknown flag: ${name}\n`);
      } else {
        return Err.of(`unknown command: ${name}\n`);
      }
    }

    const help = values(command.flags as Command.Flags).find(
      (flag) => flag.name === "help"
    );

    if (help !== undefined) {
      for (const [, value] of help.parse(argv)) {
        if (Option.isOption(value) && value.isSome()) {
          return Ok.of(command.help() + "\n");
        }
      }
    }

    const result = command.parse(argv.slice(1));

    if (result.isErr()) {
      return result;
    }

    return command.run(result.get());
  }

  public help(): string {
    return `
${Text.wrap(this._description, 80)}

${Marker.bold("Version:")}
  ${this._name}/${this._version}

${Marker.bold("Usage:")}
  ${Marker.bold("$")} ${this._binary} [command]

${Marker.bold("Commands:")}
${[...values(this._commands)]
  .map(
    (command) =>
      `  ${Marker.bold(command.name)}\n${Text.indent(
        Text.wrap(command.description, 76),
        4
      )}`
  )
  .join("\n\n")}
    `.trim();
  }

  public toJSON(): Application.JSON {
    return {
      name: this._name,
      description: this._description,
      version: this._version,
      commands: values(this._commands).map((command) => command.toJSON()),
    };
  }
}

/**
 * @internal
 */
export namespace Application {
  export interface JSON {
    [key: string]: json.JSON;
    name: string;
    description: string;
    version: string;
    commands: Array<Command.JSON>;
  }

  export interface Commands {
    readonly [name: string]: Command<any, any>;
  }
}
