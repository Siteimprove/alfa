#!/usr/bin/env node

import yargs from "yargs";

import * as commands from "./alfa/commands";

const { keys } = Object;

keys(commands).reduce((argv, key) => {
  const command = commands[key as keyof typeof commands];

  return argv.command(
    command.command,
    command.describe,
    command.builder,
    command.handler
  );
}, yargs).argv;
