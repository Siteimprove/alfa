import { Task, execute } from "@foreman/api";
import { watch } from "@foreman/fs";
import { notify } from "@foreman/notify";
import * as tap from "./tasks/tap";
import * as typescript from "./tasks/typescript";
import * as locale from "./tasks/locale";

watch(
  [
    "packages/*/src/**/*.ts",
    "packages/*/test/**/*.ts{,x}",
    "packages/**/*.hjson"
  ],
  ["add", "change"],
  async (event, path) => {
    notify({
      message: `File ${event === "add" ? "added" : "changed"}`,
      value: path
    });

    const tasks: Array<Task> = [];

    if (/\.hjson$/.test(path)) {
      tasks.push(locale.transform);
    } else {
      tasks.push(typescript.diagnose);

      if (/spec\.tsx?$/.test(path)) {
        tasks.push(tap.test);
      } else if (!/\.d\.ts$/.test(path)) {
        tasks.push(typescript.compile);
      }
    }

    try {
      await execute(tasks, path);
    } catch (error) {}
  }
).then(() => {
  notify({
    message: "Watching files for changes",
    type: "watch"
  });
});
