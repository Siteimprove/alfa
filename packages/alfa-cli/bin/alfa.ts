#!/usr/bin/env node

import * as command from "@oclif/command";
import * as errors from "@oclif/errors";

async function alfa() {
  try {
    await command.run();
  } catch (err) {
    errors.handle(err);
  }
}

alfa();
