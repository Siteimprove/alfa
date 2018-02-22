import { Task, execute } from "@foreman/api";
import { expand } from "@foreman/fs";
import { notify } from "@foreman/notify";
import * as typescript from "./tasks/typescript";
import * as locale from "./tasks/locale";

async function build(): Promise<void> {
  for (const path of await expand("packages/**/*.hjson")) {
    notify({ message: "Building", value: path, desktop: false });

    try {
      await execute([locale.transform], path);
    } catch (error) {
      process.exit(1);
    }
  }

  for (const path of await expand("packages/*/src/**/*.ts")) {
    if (/d\.ts$/.test(path)) {
      continue;
    }

    notify({ message: "Building", value: path, desktop: false });

    try {
      await execute([typescript.check, typescript.transform], path);
    } catch (error) {
      process.exit(1);
    }
  }

  for (const path of await expand("packages/*/test/**/*.ts{,x}")) {
    notify({ message: "Building", value: path, desktop: false });

    try {
      await execute([typescript.check], path);
    } catch (error) {
      process.exit(1);
    }
  }
}

build();
