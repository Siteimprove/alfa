import { Task, execute } from "@foreman/api";
import { watch } from "@foreman/fs";
import { notify } from "@foreman/notify";
import * as tap from "./tasks/tap";
import * as typescript from "./tasks/typescript";
import { isBench, isTest, isDefinition } from "./guards";

watch(
  "packages/*/{bench,src,test}/**/*.ts{,x}",
  ["add", "change"],
  async (event, path) => {
    notify({
      message: `File ${event === "add" ? "added" : "changed"}`,
      value: path
    });

    const tasks: Array<Task> = [];

    tasks.push(typescript.diagnose);

    if (!isBench(path)) {
      if (isTest(path)) {
        tasks.push(tap.test);
      } else if (!isDefinition(path)) {
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
