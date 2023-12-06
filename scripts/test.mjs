import async from "async";
import { execaNode } from "execa";
import os from "os";

import { builder } from "./common/builder.mjs";
import { flags } from "./common/flags.mjs";
import { system } from "./common/system.mjs";

const status = builder.build(flags.project);

if (status !== 0) {
  system.exit(status);
}

test(flags.project);

function test(root = "packages") {
  let first = true;
  let frameIndex = 0;
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

  async.eachLimit(
    system.readDirectory(root, [".spec.ts", ".spec.tsx"], ["node_modules"]),
    os.cpus().length,
    (fileName, done) => {
      if (!first) {
        // Move cursor up one line and 13 to the left and erase
        system.write("\x1B[1A\x1B[13D\x1B[K");
      }
      const frame = frames[frameIndex % frames.length];
      system.write(frame + ` testing ${fileName}`);
      system.write(system.newLine);
      frameIndex++;
      first = false;

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
}
