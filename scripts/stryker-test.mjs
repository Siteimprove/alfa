#!/usr/bin/env node

import async from "async";
import { execaNode } from "execa";
import os from "os";

import { system } from "./common/system.mjs";

async.eachLimit(
  system.readDirectory("packages", [".spec.ts", ".spec.tsx"], ["node_modules"]),
  os.cpus().length,
  (fileName, done) => {
    execaNode(fileName.replace(/\.tsx?$/, ".js"), [], {
      nodeOptions: [...process.execArgv, "--enable-source-maps"],
      stdio: "inherit",
    }).then(
      () => done(),
      (err) => done(err),
    );
  },
  (err) => {
    if (err) {
      system.exit(1);
    }
  },
);
