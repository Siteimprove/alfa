import async from "async";
import { execaNode } from "execa";
import os from "node:os";

import { startVitest, parseCLI } from "vitest/node";

import { builder } from "./common/builder.mjs";
import { flags } from "./common/flags.mjs";
import { system } from "./common/system.mjs";

const status = builder.build(flags.project);

if (status !== 0) {
  system.exit(status);
}

parseCLI("vitest");
const vitest = await startVitest("test");

await vitest?.close;
