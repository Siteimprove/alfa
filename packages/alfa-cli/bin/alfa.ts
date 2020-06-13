#!/usr/bin/env node

import { Application } from "../src/application";

import * as pkg from "../package.json";

import audit from "./alfa/command/audit";
import scrape from "./alfa/command/scrape";

const application = Application.of(
  pkg.name,
  pkg.version,
  `The tool for all your accessibility needs on the command line.`,
  {
    audit,
    scrape,
  }
);

application.run(process.argv.slice(2)).then((result) => {
  if (result.isOk()) {
    process.stdout.write(result.get());
  } else {
    process.stderr.write(result.getErr());
    process.exitCode = 1;
  }
});
