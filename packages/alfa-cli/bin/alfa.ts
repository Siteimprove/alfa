#!/usr/bin/env node

import { values } from "@siteimprove/alfa-util";
import yargs from "yargs";

import * as commands from "./alfa/commands";

values(commands).reduce((argv, command) => {
  return argv.command(
    command.command,
    command.describe,
    command.builder,
    command.handler
  );
}, yargs).argv;
