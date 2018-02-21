import { Task, execute } from "@foreman/api";
import { expand } from "@foreman/fs";
import { notify } from "@foreman/notify";
import * as babel from "./tasks/babel";
import * as typescript from "./tasks/typescript";
import * as locale from "./tasks/locale";

async function build(): Promise<void> {
  const paths = await expand([
    "packages/**/*.hjson",
    "packages/**/src/**/*.ts",
    "packages/**/test/**/*.ts{,x}"
  ]);

  for (const path of paths) {
    notify({
      message: "Building",
      value: path,
      desktop: false
    });

    const tasks: Array<Task> = [];

    if (/\.hjson$/.test(path)) {
      tasks.push(locale.transform);
    } else {
      tasks.push(typescript.check);

      if (!/spec\.tsx?$/.test(path)) {
        tasks.push(babel.transform);
      }
    }

    try {
      await execute(tasks, path);
    } catch (error) {
      process.exit(1);
    }
  }
}

build();
